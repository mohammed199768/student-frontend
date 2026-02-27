import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';
import { logger } from '@/lib/utils/logger';
import { FEATURE_FLAGS } from '@/lib/config/feature-flags';
import { apiMetrics } from '@/lib/api/metrics';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const AUTH_READY_TIMEOUT_MS = 5000;
const REFRESH_COOLDOWN_MS = 15000;
type AuthLifecycleStatus = 'initializing' | 'authenticated' | 'guest';

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined');
}

/**
 * SECURITY: In-Memory Token Storage
 * Tokens are NEVER persisted to localStorage or sessionStorage.
 * This eliminates XSS token theft vulnerabilities.
 */
class ApiClient {
  private axiosInstance: AxiosInstance;
  private accessToken: string | null = null;
  private refreshPromise: Promise<string | null> | null = null;
  private refreshBlockedUntil = 0;
  private activeControllers: Map<string, AbortController> = new Map();
  private authLifecycleStatus: AuthLifecycleStatus = 'initializing';
  private authReadyResolvers: Array<() => void> = [];
  private isSessionExpiryHandled = false;
  private lastHealthCheckAt = 0;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    apiMetrics.startReporter();
    this.setupInterceptors();
  }

  private isAuthMeRequest(url?: string): boolean {
    return !!url?.includes('/auth/me');
  }

  private isAuthProtectedRequest(url?: string): boolean {
    if (!url) return false;

    const protectedPrefixes = [
      '/auth/me',
      '/auth/profile',
      '/auth/logout',
      '/auth/verify-email',
      '/auth/resend-verification',
      '/students/',
      '/courses/',
      '/progress/',
      '/enrollments/',
    ];

    return protectedPrefixes.some((prefix) => url.includes(prefix));
  }

  private isAuthBypassEndpoint(url: string): boolean {
    return (
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/forgot-password') ||
      url.includes('/auth/reset-password')
    );
  }

  private resolveAuthReadyWaiters() {
    this.authReadyResolvers.forEach((resolve) => resolve());
    this.authReadyResolvers = [];
  }

  private async waitForAuthReady(timeoutMs = AUTH_READY_TIMEOUT_MS): Promise<void> {
    if (this.authLifecycleStatus !== 'initializing') return;

    await Promise.race([
      new Promise<void>((resolve) => this.authReadyResolvers.push(resolve)),
      new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
    ]);
  }

  private shouldAttemptRefresh(error: AxiosError, originalRequest: InternalAxiosRequestConfig & { _retry?: boolean }): boolean {
    if (error.response?.status !== 401 || originalRequest._retry) {
      return false;
    }

    const requestUrl = originalRequest.url || '';
    if (this.isAuthBypassEndpoint(requestUrl)) {
      return false;
    }

    if (Date.now() < this.refreshBlockedUntil) {
      logger.warn('Refresh cooldown active - skipping refresh attempt', { requestUrl });
      return false;
    }

    const responseMessage = String((error.response?.data as { message?: string } | undefined)?.message || '').toLowerCase();
    const looksMissingToken =
      responseMessage.includes('token missing') ||
      responseMessage.includes('authentication token missing') ||
      responseMessage.includes('missing or invalid');
    const looksExpiredToken =
      responseMessage.includes('expired') ||
      responseMessage.includes('invalid or expired access token') ||
      responseMessage.includes('jwt expired');

    if (!this.accessToken && !looksExpiredToken) {
      return false;
    }

    if (looksMissingToken && !looksExpiredToken) {
      return false;
    }

    return true;
  }

  private async refreshAccessToken(reason: 'bootstrap' | 'response_401'): Promise<string | null> {
    if (Date.now() < this.refreshBlockedUntil) {
      return null;
    }

    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    apiMetrics.trackRefreshAttempt(reason);
    this.refreshPromise = (async () => {
      try {
        logger.info('Attempting token refresh', { reason });
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data.data?.accessToken;
        if (!newToken) {
          throw new Error('Invalid refresh response');
        }

        this.setAccessToken(newToken);
        logger.info('Token refresh successful');
        return newToken;
      } catch (refreshError) {
        apiMetrics.trackRefreshFailure();
        logger.error('Token refresh failed');
        this.clearAccessToken();
        this.refreshBlockedUntil = Date.now() + REFRESH_COOLDOWN_MS;
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private handleSessionExpired() {
    this.clearAccessToken();
    this.setAuthLifecycleStatus('guest');

    if (this.isSessionExpiryHandled) return;
    this.isSessionExpiryHandled = true;
    setTimeout(() => {
      this.isSessionExpiryHandled = false;
    }, 1500);

    if (typeof window === 'undefined') {
      return;
    }

    const path = window.location.pathname;
    const protectedSegments = ['/dashboard', '/profile', '/learn', '/enroll'];
    const isProtected = protectedSegments.some((segment) => path.includes(segment));

    if (isProtected) {
      logger.warn('Session expired on protected route - forcing redirect');
      const currentLang = path.startsWith('/ar') ? 'ar' : 'en';
      const redirectTarget = path.replace(/^\/(en|ar)/, '') || '/dashboard';
      window.location.href = `/${currentLang}/login?reason=session_expired&redirect=${encodeURIComponent(redirectTarget)}`;
    } else {
      logger.info('Session expired on public route - staying in Guest Mode');
    }
  }

  private setupInterceptors() {
    // Request interceptor: Attach in-memory token
    this.axiosInstance.interceptors.request.use(async (config) => {
      apiMetrics.trackRequest(config.url);

      const requestUrl = config.url || '';
      if (FEATURE_FLAGS.FEATURE_HEALTH_POLLING_V2 && requestUrl.includes('/health')) {
        const now = Date.now();
        const hasPreviousHealthRequest = this.lastHealthCheckAt > 0;
        const isHidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
        const isTooFrequent = hasPreviousHealthRequest && now - this.lastHealthCheckAt < 60_000;
        const isUnauthenticatedPoll =
          hasPreviousHealthRequest && this.authLifecycleStatus !== 'authenticated';

        if (isHidden || isTooFrequent || isUnauthenticatedPoll) {
          throw new axios.CanceledError('Blocked noisy /health request by FEATURE_HEALTH_POLLING_V2');
        }

        this.lastHealthCheckAt = now;
      }

      if (
        FEATURE_FLAGS.FEATURE_AUTH_READINESS_GUARD &&
        this.authLifecycleStatus === 'initializing' &&
        this.isAuthProtectedRequest(requestUrl)
      ) {
        await this.waitForAuthReady();
      }

      if (FEATURE_FLAGS.FEATURE_AUTH_NOSTORE && this.isAuthMeRequest(requestUrl)) {
        config.headers = config.headers || {};
        config.headers['Cache-Control'] = 'no-store';
        config.headers['Pragma'] = 'no-cache';
        config.params = {
          ...(config.params || {}),
          _ts: Date.now(),
        };
      }

      if (this.accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      
      // DEV INSTRUMENTATION: Log Auth Header Presence (Phase 6)
      if (process.env.NODE_ENV === 'development') {
         const hasAuth = !!config.headers?.Authorization;
         if (!config.url?.includes('/auth/login') && !config.url?.includes('/auth/refresh')) {
           console.debug(`[Student API] Req: ${config.url} | Auth: ${hasAuth ? 'YES' : 'NO'}`);
         }
      }
      
      return config;
    });

    // Response interceptor: Handle 401 and token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        apiMetrics.trackResponseStatus(error.response?.status);

        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        if (!originalRequest) {
          return Promise.reject(error);
        }

        // Skip refresh logic for aborted requests
        if (axios.isCancel(error)) {
          return Promise.reject(error);
        }

        if (
          FEATURE_FLAGS.FEATURE_REFRESH_SINGLE_FLIGHT &&
          this.shouldAttemptRefresh(error, originalRequest)
        ) {
          logger.warn('401 received - evaluating refresh flow', { url: originalRequest.url });
          originalRequest._retry = true;

          const newToken = await this.refreshAccessToken('response_401');
          if (newToken) {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return this.axiosInstance(originalRequest);
          }

          this.handleSessionExpired();
          return Promise.reject(error);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * SECURITY: Set token in memory only - never persisted to storage
   */
  public setAccessToken(token: string) {
    this.accessToken = token;
    this.isSessionExpiryHandled = false;
    // Also update default headers for the axios instance
    this.axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  /**
   * SECURITY: Clear token from memory
   */
  public clearAccessToken() {
    this.accessToken = null;
    delete this.axiosInstance.defaults.headers.common.Authorization;
  }

  public setAuthLifecycleStatus(status: AuthLifecycleStatus) {
    this.authLifecycleStatus = status;
    if (status !== 'initializing') {
      this.resolveAuthReadyWaiters();
    }
  }

  public getAuthLifecycleStatus(): AuthLifecycleStatus {
    return this.authLifecycleStatus;
  }

  public async bootstrapSession(): Promise<boolean> {
    if (this.accessToken) {
      return true;
    }

    const refreshedToken = await this.refreshAccessToken('bootstrap');
    return !!refreshedToken;
  }

  /**
   * SECURITY: Get token for secure operations (e.g., PDF viewer)
   * Returns null if not authenticated
   */
  public getToken(): string | null {
    return this.accessToken;
  }

  /**
   * Check if currently authenticated (has token in memory)
   */
  public isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  /**
   * Create an AbortController for a request, tracked by a unique key
   */
  public createAbortController(key: string): AbortController {
    this.abortRequest(key);
    const controller = new AbortController();
    this.activeControllers.set(key, controller);
    return controller;
  }

  /**
   * Abort a request by its key
   */
  public abortRequest(key: string): void {
    const controller = this.activeControllers.get(key);
    if (controller) {
      controller.abort();
      this.activeControllers.delete(key);
    }
  }

  private cleanupController(key?: string): void {
    if (key) {
      this.activeControllers.delete(key);
    }
  }

  /**
   * GET request with optional AbortController support
   */
  async get<T = any>(url: string, config: AxiosRequestConfig & { abortKey?: string } = {}) {
    const { abortKey, ...axiosConfig } = config;
    
    if (abortKey) {
      const controller = this.createAbortController(abortKey);
      axiosConfig.signal = controller.signal;
    }

    try {
      return await this.axiosInstance.get<T>(url, axiosConfig);
    } finally {
      this.cleanupController(abortKey);
    }
  }

  /**
   * POST request with optional AbortController support
   */
  async post<T = any>(url: string, data?: unknown, config: AxiosRequestConfig & { abortKey?: string } = {}) {
    const { abortKey, ...axiosConfig } = config;
    
    if (abortKey) {
      const controller = this.createAbortController(abortKey);
      axiosConfig.signal = controller.signal;
    }

    try {
      return await this.axiosInstance.post<T>(url, data, axiosConfig);
    } finally {
      this.cleanupController(abortKey);
    }
  }

  /**
   * PUT request with optional AbortController support
   */
  async put<T = any>(url: string, data?: unknown, config: AxiosRequestConfig & { abortKey?: string } = {}) {
    const { abortKey, ...axiosConfig } = config;
    
    if (abortKey) {
      const controller = this.createAbortController(abortKey);
      axiosConfig.signal = controller.signal;
    }

    try {
      return await this.axiosInstance.put<T>(url, data, axiosConfig);
    } finally {
      this.cleanupController(abortKey);
    }
  }

  /**
   * PATCH request with optional AbortController support
   */
  async patch<T = any>(url: string, data?: unknown, config: AxiosRequestConfig & { abortKey?: string } = {}) {
    const { abortKey, ...axiosConfig } = config;
    
    if (abortKey) {
      const controller = this.createAbortController(abortKey);
      axiosConfig.signal = controller.signal;
    }

    try {
      return await this.axiosInstance.patch<T>(url, data, axiosConfig);
    } finally {
      this.cleanupController(abortKey);
    }
  }

  /**
   * DELETE request with optional AbortController support
   */
  async delete<T = any>(url: string, config: AxiosRequestConfig & { abortKey?: string } = {}) {
    const { abortKey, ...axiosConfig } = config;
    
    if (abortKey) {
      const controller = this.createAbortController(abortKey);
      axiosConfig.signal = controller.signal;
    }

    try {
      return await this.axiosInstance.delete<T>(url, axiosConfig);
    } finally {
      this.cleanupController(abortKey);
    }
  }

  /**
   * Fetch a resource as a Blob (for secure document viewing)
   * Uses Authorization header - NO token in URL
   */
  async getBlob(url: string, config: AxiosRequestConfig & { abortKey?: string } = {}): Promise<Blob> {
    const response = await this.get<Blob>(url, { ...config, responseType: 'blob' });
    return response.data;
  }

  /**
   * Access the raw axios instance for advanced use cases
   */
  get defaults() {
    return this.axiosInstance.defaults;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;

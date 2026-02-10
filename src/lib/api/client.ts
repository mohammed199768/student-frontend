import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosRequestConfig } from 'axios';
import { logger } from '@/lib/utils/logger';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
  private isRefreshing = false;
  private refreshSubscribers: Array<{
    resolve: (token: string | null) => void;
    reject: (error: Error) => void;
  }> = [];
  private activeControllers: Map<string, AbortController> = new Map();

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor: Attach in-memory token
    this.axiosInstance.interceptors.request.use((config) => {
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
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Skip refresh logic for aborted requests
        if (axios.isCancel(error)) {
          return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('auth/refresh')) {
          logger.warn('401 received - checking refresh state', { url: originalRequest.url, isRefreshing: this.isRefreshing });
          
          if (this.isRefreshing) {
            logger.info('Queueing request - refresh in progress');
            return new Promise((resolve, reject) => {
              this.refreshSubscribers.push({
                resolve: (token) => {
                  if (token && originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                  }
                  resolve(this.axiosInstance(originalRequest));
                },
                reject
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;
          logger.info('Attempting token refresh');

          try {
            const { data } = await axios.post(
              `${API_BASE_URL}/auth/refresh`,
              {},
              { withCredentials: true }
            );

            const newToken = data.data?.accessToken;
            if (newToken) {
              logger.info('Token refresh successful');
              this.setAccessToken(newToken);

              // Resolve all queued requests
              this.refreshSubscribers.forEach(({ resolve }) => resolve(newToken));
              this.refreshSubscribers = [];

              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              return this.axiosInstance(originalRequest);
            } else {
              throw new Error('Invalid refresh response');
            }
          } catch (refreshError) {
            logger.error('Token refresh failed');
            
            // Reject all queued requests
            const error = refreshError instanceof Error ? refreshError : new Error('Token refresh failed');
            this.refreshSubscribers.forEach(({ reject }) => reject(error));
            this.refreshSubscribers = [];

            // Clear token state
            this.clearAccessToken();

            // Handle redirect for protected routes
            if (typeof window !== 'undefined') {
              const path = window.location.pathname;
              const protectedSegments = ['/dashboard', '/profile', '/learn', '/enroll'];
              const isProtected = protectedSegments.some(segment => path.includes(segment));

              if (isProtected) {
                logger.warn('Session expired on protected route - forcing redirect');
                const currentLang = path.startsWith('/ar') ? 'ar' : 'en';
                const redirectTarget = path.replace(/^\/(en|ar)/, '') || '/dashboard';
                window.location.href = `/${currentLang}/login?reason=session_expired&redirect=${encodeURIComponent(redirectTarget)}`;
              } else {
                logger.info('Session expired on public route - staying in Guest Mode');
              }
            }
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
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

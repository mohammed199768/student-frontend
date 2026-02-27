'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { User } from '@/lib/api/types';
import { apiClient } from '@/lib/api/client';
import { useRouter } from '@/i18n/routing';
import toast from 'react-hot-toast';
import { isStudentRole } from '@/lib/rbac';
import { useQueryClient } from '@tanstack/react-query';

type AuthStatus = 'initializing' | 'authenticated' | 'guest';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    status: AuthStatus;
    isReady: boolean;
    /**
     * SECURITY: Token is stored in-memory only via apiClient
     * The token parameter is passed here and immediately stored in the apiClient closure
     */
    login: (accessToken: string, redirectPath?: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<boolean>;
    /**
     * SECURITY: Get current token for secure operations (e.g., PDF viewing)
     */
    getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState<AuthStatus>('initializing');
    const router = useRouter();
    const queryClient = useQueryClient();

    const applyAuthStatus = useCallback((nextStatus: AuthStatus) => {
        setStatus(nextStatus);
        setIsLoading(nextStatus === 'initializing');
        apiClient.setAuthLifecycleStatus(nextStatus);
    }, []);

    const refreshUser = useCallback(async (): Promise<boolean> => {
        try {
            const { data } = await apiClient.get('/auth/me');
            const userData = data.data as User & { emailVerifiedAt?: string | null; isEmailVerified?: boolean };

            // RBAC GUARD: Ensure only STUDENT role can access student frontend
            if (userData && !isStudentRole(userData.role)) {
                console.warn(`[Auth] Access denied. Role: ${userData.role}`);
                document.cookie = 'isLoggedIn=; path=/; max-age=0';
                setUser(null);
                apiClient.clearAccessToken();
                applyAuthStatus('guest');
                return false;
            }

            // Handle backend returning firstName/lastName instead of fullName
            if (!userData.fullName && (userData.firstName || userData.lastName)) {
                userData.fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
            }

            if (typeof userData.isEmailVerified === 'boolean') {
                userData.isEmailVerified = userData.isEmailVerified;
            } else if ('emailVerifiedAt' in userData) {
                userData.isEmailVerified = !!userData.emailVerifiedAt;
            } else {
                userData.isEmailVerified = undefined;
            }

            setUser(userData);
            applyAuthStatus('authenticated');
            return true;
        } catch {
            console.debug('Auth check failed - switching to Guest Mode');
            setUser(null);
            apiClient.clearAccessToken();
            document.cookie = 'isLoggedIn=; path=/; max-age=0';
            applyAuthStatus('guest');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [applyAuthStatus]);

    useEffect(() => {
        let isMounted = true;

        const initializeAuth = async () => {
            applyAuthStatus('initializing');

            // Attempt auth bootstrap only when session hint cookie exists.
            const hasSessionHint = document.cookie.includes('isLoggedIn=true');
            if (!hasSessionHint) {
                if (!isMounted) return;
                setUser(null);
                applyAuthStatus('guest');
                return;
            }

            const hasSession = await apiClient.bootstrapSession();
            if (!hasSession) {
                if (!isMounted) return;
                setUser(null);
                document.cookie = 'isLoggedIn=; path=/; max-age=0';
                applyAuthStatus('guest');
                return;
            }

            if (!isMounted) return;
            await refreshUser();
        };

        initializeAuth();

        return () => {
            isMounted = false;
        };
    }, [applyAuthStatus, refreshUser]);

    /**
     * SECURITY: Login stores token in memory only via apiClient.setAccessToken()
     * No localStorage or sessionStorage is used.
     */
    const login = async (accessToken: string, redirectPath?: string) => {
        apiClient.setAccessToken(accessToken);
        applyAuthStatus('initializing');

        // Non-sensitive session hint for middleware routing.
        document.cookie = `isLoggedIn=true; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

        const hydrated = await refreshUser();
        if (!hydrated) {
            throw new Error('Failed to initialize authenticated user');
        }

        queryClient.clear();
        router.push(redirectPath || '/dashboard');
    };

    /**
     * SECURITY: Logout clears token from memory via apiClient.clearAccessToken()
     */
    const logout = async () => {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            apiClient.clearAccessToken();
            document.cookie = 'isLoggedIn=; path=/; max-age=0';
            setUser(null);
            applyAuthStatus('guest');
            queryClient.clear();
            router.push('/login');
            toast.success('Logged out successfully');
        }
    };

    /**
     * SECURITY: Provide token access for components that need it (e.g., PDF viewer)
     */
    const getToken = (): string | null => {
        return apiClient.getToken();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                status,
                isReady: status !== 'initializing',
                login,
                logout,
                refreshUser,
                getToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

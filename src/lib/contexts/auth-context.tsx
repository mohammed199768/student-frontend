'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/lib/api/types';
import { apiClient } from '@/lib/api/client';
import { useRouter } from '@/i18n/routing';
import toast from 'react-hot-toast';
import { isStudentRole } from '@/lib/rbac';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    /**
     * SECURITY: Token is stored in-memory only via apiClient
     * The token parameter is passed here and immediately stored in the apiClient closure
     */
    login: (accessToken: string, redirectPath?: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    /**
     * SECURITY: Get current token for secure operations (e.g., PDF viewing)
     */
    getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const refreshUser = async () => {
        try {
            const { data } = await apiClient.get('/auth/me');
            const userData = data.data;

            // RBAC GUARD: Ensure only STUDENT role can access student frontend
            if (userData && !isStudentRole(userData.role)) {
                console.warn(`[Auth] Access Denied. Role: ${userData.role}`);
                // Clear session hint to prevent infinite retry loops
                document.cookie = 'isLoggedIn=; path=/; max-age=0';
                setUser(null);
                apiClient.clearAccessToken();
                return;
            }

            // Handle backend returning firstName/lastName instead of fullName
            if (!userData.fullName && (userData.firstName || userData.lastName)) {
                userData.fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
            }

            setUser(userData);
        } catch {
            console.debug('Auth check failed - switching to Guest Mode');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Optimization: Only attempt to fetch user if we have a session hint
        // This prevents 401 noise on public pages for guest users
        // The isLoggedIn cookie is a non-sensitive hint (not the actual token)
        if (document.cookie.includes('isLoggedIn=true')) {
            refreshUser();
        } else {
            setIsLoading(false);
        }
    }, []);

    /**
     * SECURITY: Login stores token in memory only via apiClient.setAccessToken()
     * No localStorage or sessionStorage is used.
     */
    const login = async (accessToken: string, redirectPath?: string) => {
        // SECURITY: Store token in memory only
        apiClient.setAccessToken(accessToken);
        
        // Set a cookie hint for the middleware (NON-SENSITIVE - just a boolean flag)
        // This is safe because it doesn't contain the actual token
        document.cookie = `isLoggedIn=true; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        
        await refreshUser();
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
            // SECURITY: Clear in-memory token
            apiClient.clearAccessToken();
            
            // Clear the session hint cookie
            document.cookie = 'isLoggedIn=; path=/; max-age=0';
            
            setUser(null);
            router.push('/login');
            toast.success('تم تسجيل الخروج بنجاح');
        }
    };

    /**
     * SECURITY: Provide token access for components that need it (e.g., PDF viewer)
     * This ensures token is passed via props/context, never stored in DOM/localStorage
     */
    const getToken = (): string | null => {
        return apiClient.getToken();
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser, getToken }}>
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

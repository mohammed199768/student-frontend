'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

const getStatusCode = (error: unknown): number | undefined => {
    const maybeError = error as { response?: { status?: number } };
    return maybeError.response?.status;
};

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        retry: (failureCount, error) => {
                            const status = getStatusCode(error);
                            if (status === 401 || status === 403) return false;
                            return failureCount < 1;
                        },
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}

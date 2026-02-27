'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/utils/logger';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        logger.error('Unhandled runtime error', { digest: error.digest }, error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 bg-white dark:bg-slate-950">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Something went wrong!</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">{error.message}</p>
                <button
                    onClick={() => reset()}
                    className="px-4 py-2 bg-primary text-white dark:text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}

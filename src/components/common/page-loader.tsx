import { Loader2 } from 'lucide-react';

/**
 * Full-page loading state with T.MANAL branding.
 * Used by Next.js loading.tsx files across all route groups.
 */
export function PageLoader() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
            <div className="page-loader__ring" />
            <div className="flex items-baseline gap-0.5" dir="ltr">
                <span className="text-2xl font-black text-indigo-400">T.</span>
                <span className="text-2xl font-black text-slate-300 dark:text-slate-500">MANAL</span>
            </div>
            <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
        </div>
    );
}

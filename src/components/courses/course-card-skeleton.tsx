import { Clock, PlayCircle } from 'lucide-react';

export function CourseCardSkeleton() {
    return (
        <div className="flex flex-col overflow-hidden rounded-[24px] border bg-slate-100 border-slate-200/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-slate-900 dark:border-slate-800 dark:shadow-xl">
            {/* Thumbnail Placeholder */}
            <div className="p-2 pb-0">
                <div className="aspect-16/10 relative rounded-[16px] overflow-hidden bg-slate-200 dark:bg-slate-800 animate-pulse">
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                        <div className="h-8 w-3/4 rounded-md bg-slate-300 dark:bg-slate-700"></div>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5 pt-4">
                {/* University Pill Placeholder */}
                <div className="mb-4 flex items-center justify-between gap-2">
                    <div className="h-9 w-36 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                    <div className="h-4 w-16 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                </div>

                <div className="mt-auto">
                    {/* Price & Action Placeholder */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                        <div className="h-6 w-20 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                        
                        <div className="flex items-center justify-center rounded-xl p-3 bg-slate-200 dark:bg-slate-800 animate-pulse">
                            <PlayCircle className="h-5 w-5 text-slate-300 dark:text-slate-700" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

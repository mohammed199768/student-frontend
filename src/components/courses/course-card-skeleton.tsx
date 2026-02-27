import { Clock, PlayCircle } from 'lucide-react';

interface CourseCardSkeletonProps {
    variant?: 'light' | 'dark';
}

export function CourseCardSkeleton({ variant = 'light' }: CourseCardSkeletonProps) {
    const isDark = variant === 'dark';
    
    // Base styles mirroring CourseCard
    const bgClass = isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200";
    const borderClass = isDark ? "border-white/10" : "border-slate-100";
    
    return (
        <div className={`flex flex-col overflow-hidden rounded-2xl border ${bgClass} shadow-sm`}>
            {/* Thumbnail Placeholder */}
            <div className="aspect-16/10 relative bg-slate-100 dark:bg-slate-800/50 animate-pulse">
                <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="h-8 w-3/4 rounded-md bg-slate-300/50 dark:bg-slate-700/50"></div>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
                {/* University Pill Placeholder */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="h-7 w-24 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                </div>

                <div className="mt-auto">
                    {/* Duration Placeholder */}
                    <div className="mb-4 flex items-center gap-4">
                        <div className="flex items-center text-slate-300 dark:text-slate-700">
                            <Clock className="mr-1.5 h-3.5 w-3.5" />
                            <div className="h-4 w-16 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                        </div>
                    </div>

                    {/* Price & Action Placeholder */}
                    <div className={`flex items-center justify-between pt-4 border-t ${borderClass}`}>
                        <div className="h-6 w-20 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                        
                        <div className="flex items-center justify-center rounded-xl p-2.5 bg-slate-200 dark:bg-slate-800 animate-pulse">
                            <PlayCircle className="h-5 w-5 text-slate-300 dark:text-slate-700" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

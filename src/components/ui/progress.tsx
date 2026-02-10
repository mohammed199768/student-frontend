'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: number;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
    ({ className, value, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                'relative h-4 w-full overflow-hidden rounded-full bg-slate-100',
                className
            )}
            {...props}
        >
            <div
                className="h-full w-full flex-1 bg-indigo-600 transition-all duration-300 origin-right"
                style={{ transform: `scaleX(${(value || 0) / 100})` }}
            />
        </div>
    )
);
Progress.displayName = 'Progress';

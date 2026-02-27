'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

interface CoursePreviewPlayerProps {
    title: string;
    trailerId?: string | null; // Bunny Video ID
}

// No Images Policy (12_CONTRACTS.md) - Placeholder only
export function CoursePreviewPlayer({ title, trailerId }: CoursePreviewPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);



    const handlePlay = () => {
        if (trailerId) {
            setIsPlaying(true);
        }
    };

    if (isPlaying && trailerId) {
        return (
            <div className="relative aspect-video bg-slate-900 flex items-center justify-center border border-white/10">
                <div className="text-center p-6">
                    <p className="text-slate-400 mb-2">Preview not available</p>
                    {/* Security Hardening: Raw iframe disabled until secure token endpoint is available */}
                </div>
            </div>
        );
    }

    return (
        <div
            className={`relative aspect-video bg-linear-to-br from-indigo-600 to-indigo-800 group ${trailerId ? 'cursor-pointer' : ''} block`}
            onClick={handlePlay}
        >
            {/* Title Placeholder - No Images */}
            <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white dark:text-white font-bold text-xl text-center px-6 line-clamp-2 drop-shadow-md">
                    {(title && title !== 'TITLE') ? title : 'Untitled course'}
                </h3>
            </div>

            {/* Play Button Overlay - Only show if trailer exists */}
            {trailerId && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                        <div className="w-12 h-12 rounded-full bg-white text-indigo-600 flex items-center justify-center pl-1 shadow-lg">
                            <Play className="w-6 h-6 fill-current" />
                        </div>
                    </div>
                </div>
            )}

            {trailerId && (
                <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="text-white dark:text-white font-bold text-sm drop-shadow-md">مشاهدة المقدمة</span>
                </div>
            )}
        </div>
    );
}



'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/lib/contexts/auth-context';
import { useLessonProgress } from '@/lib/api/hooks/use-progress';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, CheckCircle2, Maximize, Minimize } from 'lucide-react';


interface VideoPlayerProps {
    assetId: string;
    courseId: string;
    lessonId: string;
    initialTime?: number;
}

export function VideoPlayer({ assetId, lessonId, initialTime = 0 }: VideoPlayerProps) {
    const { user } = useAuth();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentTime, setCurrentTime] = useState(initialTime);
    const [duration, setDuration] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const lastSavedTime = useRef(initialTime);

    const { mutate: updateProgress } = useLessonProgress();

    // Fetch Signed Playback URL
    const { data, isLoading, error } = useQuery({
        queryKey: ['video-play', assetId],
        queryFn: async () => {
            const response = await apiClient.get<{ data: { embedUrl: string } }>(`/courses/assets/${assetId}/play`);
            return response.data.data;
        },
    });

    // Handle Progress Validation & Submission
    const handleProgress = useCallback((time: number, totalDuration: number, force = false, completed = false) => {
        if (!lessonId) return;

        const progressPercent = totalDuration > 0 ? (time / totalDuration) : 0;
        const isFinished = completed || progressPercent >= 0.95;

        // Optimistic UI update
        if (isFinished && !isCompleted) {
            setIsCompleted(true);
        }

        // Throttle: Save every 20 seconds, or if finished, or if forced (paused)
        if (force || isFinished || Math.abs(time - lastSavedTime.current) >= 20) {
            updateProgress({
                lessonId,
                lastPositionSeconds: Math.floor(time),
                isVideoCompleted: isFinished
            });
            lastSavedTime.current = time;
        }
    }, [lessonId, updateProgress, isCompleted]);

    // Setup Bunny Stream Event Listener
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Security: Only accept messages from Bunny CDN
            if (!event.origin.includes('mediadelivery.net') && !event.origin.includes('bunny.net')) {
                return;
            }

            try {
                // Bunny Stream sends messages as JSON strings sometimes, or objects
                // We handle common player events
                const msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

                if (!msg) return;

                if (msg.type === 'player-time-update') {
                    // Payload: { currentTime: 12.5, duration: 100 }
                    const { currentTime: t, duration: d } = msg.payload || {};
                    if (typeof t === 'number') {
                        setCurrentTime(t);
                        if (d) setDuration(d);
                        handleProgress(t, d || duration);
                    }
                }

                if (msg.type === 'player-ended') {
                    handleProgress(currentTime, duration, true, true);
                }

                if (msg.type === 'player-pause') {
                    handleProgress(currentTime, duration, true);
                }

            } catch {
                // Ignore parsing errors from unrelated messages
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [handleProgress, duration, currentTime]);

    // Listen for fullscreen changes (user may exit via Esc key)
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Custom Fullscreen Toggle (fullscreens container with watermark)
    const toggleFullscreen = async () => {
        if (!containerRef.current) return;
        
        try {
            if (!document.fullscreenElement) {
                await containerRef.current.requestFullscreen();
                setIsFullscreen(true);
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (err) {
            console.error('Fullscreen error:', err);
        }
    };

    // Handle "Resume" functionality
    // We can't easily seek the iframe unless we use the Bunny Player SDK or correct postMessage
    // For simple iframes, we append `?t={seconds}` to the src if it's the first load
    // But Bunny uses '#t={seconds}' often.
    // NOTE: The current `data.embedUrl` is signed. We must append time carefully.

    const videoSrc = data?.embedUrl
        ? `${data.embedUrl}${data.embedUrl.includes('?') ? '&' : '?'}t=${Math.floor(initialTime)}&autoplay=false`
        : '';

    if (isLoading) return (
        <div className="flex items-center justify-center h-full bg-slate-900">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        </div>
    );

    if (error || !data) return (
        <div className="flex items-center justify-center h-full text-red-500 bg-slate-900 flex-col gap-2">
            <p>خطأ في تحميل الفيديو</p>
            <button onClick={() => window.location.reload()} className="text-sm underline">إعادة المحاولة</button>
        </div>
    );

    return (
        <div 
            ref={containerRef}
            className="relative w-full h-full bg-black group overflow-hidden" 
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Video Iframe - Native fullscreen and PiP DISABLED for security */}
            <iframe
                ref={iframeRef}
                src={videoSrc || undefined}
                className="absolute top-0 left-0 w-full h-full border-none z-0"
                allow="accelerometer; gyroscope; autoplay; encrypted-media;"
                referrerPolicy="strict-origin-when-cross-origin"
                // @ts-ignore - HTML attributes for video security
                disablePictureInPicture={true}
                // @ts-ignore - Disable download, playback rate, and fullscreen controls
                controlsList="nodownload noplaybackrate nofullscreen"
            ></iframe>

            {/* Dynamic Watermark */}
            <div className="absolute inset-0 pointer-events-none z-10 select-none overflow-hidden">
                <div className="absolute animate-watermark opacity-20 text-[10px] sm:text-xs font-mono text-white whitespace-nowrap drop-shadow-md mix-blend-difference px-2 py-1 rounded bg-black/50">
                    {user?.email} • {user?.id}
                </div>
            </div>

            {/* Custom Fullscreen Button - Preserves Watermark */}
            <button
                onClick={toggleFullscreen}
                className="absolute bottom-4 right-4 z-20 bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                title={isFullscreen ? 'خروج من ملء الشاشة' : 'ملء الشاشة'}
            >
                {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                ) : (
                    <Maximize className="w-5 h-5" />
                )}
            </button>

            {/* Completion Indicator */}
            {isCompleted && (
                <div className="absolute top-4 left-4 z-20 pointer-events-none animate-in fade-in slide-in-from-top-2">
                    <div className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center shadow-lg">
                        <CheckCircle2 className="w-3 h-3 mr-1.5" />
                        مكتمل
                    </div>
                </div>
            )}

            <style jsx>{`
        @keyframes watermark {
          0% { top: 5%; left: 5%; }
          25% { top: 5%; left: 60%; }
          50% { top: 85%; left: 60%; }
          75% { top: 85%; left: 5%; }
          100% { top: 5%; left: 5%; }
        }
        .animate-watermark {
          animation: watermark 30s linear infinite;
        }
        /* Hide Safari PiP button */
        video::-webkit-media-controls-picture-in-picture-button {
          display: none !important;
        }
        /* Hide all native video controls for extra security */
        video::-webkit-media-controls-fullscreen-button {
          display: none !important;
        }
      `}</style>
        </div>
    );
}

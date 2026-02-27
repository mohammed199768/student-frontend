'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

const MOBILE_BREAKPOINT = 768;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const detectSafari = () => {
    if (typeof navigator === 'undefined') return false;
    const userAgent = navigator.userAgent;
    return /Safari/i.test(userAgent) && !/Chrome|Chromium|CriOS|Edg|OPR|OPiOS|FxiOS/i.test(userAgent);
};

const detectMobile = () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= MOBILE_BREAKPOINT;
};

const detectReducedMotion = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(REDUCED_MOTION_QUERY).matches;
};

export function BackgroundWrapper() {
    const [particles, setParticles] = useState<Array<{ w: number, h: number, top: number, left: number, duration: number, delay: number }>>([]);
    const [isMobile, setIsMobile] = useState(detectMobile);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(detectReducedMotion);
    const [mounted, setMounted] = useState(false);
    const { resolvedTheme } = useTheme();
    const isSafari = detectSafari();
    const isDark = !mounted || resolvedTheme === 'dark';
    const backgroundClass = isDark
        ? 'bg-linear-to-br from-slate-900 via-slate-900 to-slate-900'
        : 'bg-linear-to-br from-white via-indigo-50/30 to-slate-50';

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        const motionMedia = window.matchMedia(REDUCED_MOTION_QUERY);
        const updateMotionPreference = (event: MediaQueryListEvent | MediaQueryList) => setPrefersReducedMotion(event.matches);
        const updateViewport = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);

        if (typeof motionMedia.addEventListener === 'function') {
            motionMedia.addEventListener('change', updateMotionPreference);
        } else {
            motionMedia.addListener(updateMotionPreference);
        }
        window.addEventListener('resize', updateViewport);

        return () => {
            if (typeof motionMedia.removeEventListener === 'function') {
                motionMedia.removeEventListener('change', updateMotionPreference);
            } else {
                motionMedia.removeListener(updateMotionPreference);
            }
            window.removeEventListener('resize', updateViewport);
        };
    }, []);

    useEffect(() => {
        const particleCount = prefersReducedMotion ? 0 : ((isMobile || isSafari) ? 8 : 20);
        const frame = window.requestAnimationFrame(() => {
            setParticles([...Array(particleCount)].map(() => ({
                w: Math.random() * 4 + 1,
                h: Math.random() * 4 + 1,
                top: Math.random() * 100,
                left: Math.random() * 100,
                duration: Math.random() * 3 + 2,
                delay: Math.random() * 2
            })));
        });

        return () => window.cancelAnimationFrame(frame);
    }, [isMobile, isSafari, prefersReducedMotion]);

    const blendClass = isSafari ? '' : 'mix-blend-screen';
    const blobAnimationClass = prefersReducedMotion ? '' : 'animate-blob';

    return (
        <div className={`fixed inset-0 z-0 pointer-events-none overflow-hidden ${backgroundClass}`}>
            {/* Background Gradients & Effects */}
            <div className={`absolute top-0 right-0 -translate-y-12 translate-x-12 h-[600px] w-[600px] rounded-full bg-indigo-600/20 blur-[48px] opacity-40 ${blendClass} ${blobAnimationClass}`.trim()}></div>
            <div className={`absolute bottom-0 left-0 -translate-x-12 translate-y-24 h-[600px] w-[600px] rounded-full bg-purple-600/20 blur-[48px] opacity-40 ${blendClass} ${blobAnimationClass} ${prefersReducedMotion ? '' : 'animation-delay-2000'}`.trim()}></div>
            <div className="absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-100/80 dark:bg-slate-800/80 blur-[48px] opacity-30"></div>

            {/* Animated Particles */}
            <div className="absolute inset-0">
                {particles.map((p, i) => (
                    <motion.div
                        key={i}
                        className="absolute bg-slate-300/30 dark:bg-white/10 rounded-full"
                        style={{
                            width: p.w,
                            height: p.h,
                            top: `${p.top}%`,
                            left: `${p.left}%`,
                        }}
                        animate={prefersReducedMotion ? { opacity: 0.2 } : {
                            y: [0, -30, 0],
                            opacity: [0, 0.5, 0],
                        }}
                        transition={prefersReducedMotion ? { duration: 0 } : {
                            duration: p.duration,
                            repeat: Infinity,
                            delay: p.delay,
                        }}
                    />
                ))}
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
        </div>
    );
}

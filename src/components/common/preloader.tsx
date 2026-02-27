'use client';

import { useEffect, useState, useCallback } from 'react';

const MIN_DISPLAY_MS = 1800;

export function Preloader() {
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState<'loading' | 'exiting' | 'done'>('loading');

    const exit = useCallback(() => {
        setProgress(100);
        const t = setTimeout(() => setPhase('exiting'), 200);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const start = Date.now();

        // Simulate fast progress ticks
        let frame: number;
        let current = 0;
        const tick = () => {
            const elapsed = Date.now() - start;
            const ratio = Math.min(elapsed / MIN_DISPLAY_MS, 1);
            // ease-out curve
            current = Math.round(ratio * 90);
            setProgress(current);
            if (ratio < 1) {
                frame = requestAnimationFrame(tick);
            }
        };
        frame = requestAnimationFrame(tick);

        const onReady = () => {
            const elapsed = Date.now() - start;
            const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
            setTimeout(exit, remaining);
        };

        if (document.readyState === 'complete') {
            onReady();
        } else {
            window.addEventListener('load', onReady, { once: true });
        }

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('load', onReady);
        };
    }, [exit]);

    if (phase === 'done') return null;

    return (
        <div
            className={`preloader ${phase === 'exiting' ? 'preloader--exit' : ''}`}
            onAnimationEnd={() => {
                if (phase === 'exiting') setPhase('done');
            }}
            aria-live="polite"
            aria-label="Loading T.MANAL"
        >
            {/* Ambient glow orbs */}
            <div className="preloader__orb preloader__orb--1" />
            <div className="preloader__orb preloader__orb--2" />
            <div className="preloader__orb preloader__orb--3" />

            {/* Grid pattern overlay */}
            <div className="preloader__grid" />

            {/* Center content */}
            <div className="preloader__center">
                {/* Glow ring */}
                <div className="preloader__ring" />

                {/* Brand text */}
                <div className="preloader__brand" dir="ltr">
                    <span className="preloader__brand-t">T.</span>
                    <span className="preloader__brand-manal">MANAL</span>
                </div>

                {/* Progress bar */}
                <div className="preloader__track">
                    <div
                        className="preloader__bar"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Tagline */}
                <p className="preloader__tagline">Educational Platform</p>
            </div>
        </div>
    );
}

'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function BackgroundWrapper() {
    const [particles, setParticles] = useState<Array<{ w: number, h: number, top: number, left: number, duration: number, delay: number }>>([]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setParticles([...Array(20)].map(() => ({
                w: Math.random() * 4 + 1,
                h: Math.random() * 4 + 1,
                top: Math.random() * 100,
                left: Math.random() * 100,
                duration: Math.random() * 3 + 2,
                delay: Math.random() * 2
            })));
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-slate-900">
            {/* Background Gradients & Effects */}
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] opacity-40 mix-blend-screen animate-blob"></div>
            <div className="absolute bottom-0 left-0 translate-y-24 -translate-x-12 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] opacity-40 mix-blend-screen animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-800/30 rounded-full blur-[100px] opacity-30"></div>

            {/* Animated Particles */}
            <div className="absolute inset-0">
                {particles.map((p, i) => (
                    <motion.div
                        key={i}
                        className="absolute bg-white/10 rounded-full"
                        style={{
                            width: p.w,
                            height: p.h,
                            top: `${p.top}%`,
                            left: `${p.left}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0, 0.5, 0],
                        }}
                        transition={{
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

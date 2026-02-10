'use client';

import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { Play, Star, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';



export function HeroSection() {
    const t = useTranslations('public.home');
    return (
        <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
            <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center text-center max-w-5xl mx-auto">

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-5 py-2 text-sm font-medium text-indigo-300 mb-8 hover:bg-indigo-500/20 transition-colors"
                    >
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        {t('hero_badge')}
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-8 leading-[1.1]"
                    >
                        {t('hero_headline_1')}
                        <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-300 via-white to-indigo-300 animate-gradient-x">
                            {t('hero_headline_2')}
                        </span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed"
                    >
                        {t('hero_subheadline')}
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16"
                    >
                        <Link
                            href="/courses"
                            className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3"
                        >
                            <Sparkles className="w-5 h-5" />
                            {t('hero_cta_primary')}
                        </Link>
                        <Link
                            href="/about"
                            className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-slate-800 text-white font-bold text-lg border border-slate-700 hover:bg-slate-700 transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                        >
                            <Play className="w-5 h-5 ml-2 fill-current" />
                            {t('hero_cta_secondary')}
                        </Link>
                    </motion.div>

                    {/* Social Proof */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="flex items-center gap-6 text-sm text-slate-400 mb-20"
                    >
                        <div className="flex -space-x-3 rtl:space-x-reverse">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                    {String.fromCharCode(64 + i)}
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="flex text-amber-400">
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                            </div>
                            <span>
                                <span className="font-bold text-white">4.9/5</span> {t('social_proof')}
                            </span>
                        </div>
                    </motion.div>

                    {/* Hero Visual - Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 100, rotateX: 20 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        transition={{ duration: 1, delay: 0.4, type: "spring" }}
                        className="relative w-full max-w-6xl mx-auto perspective-1000 group"
                    >
                        {/* Main Dashboard Frame */}
                        <div className="relative bg-slate-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden aspect-video md:aspect-21/9">
                            {/* Browser Header */}
                            <div className="absolute top-0 inset-x-0 h-10 bg-slate-950/50 border-b border-white/5 flex items-center px-4 gap-2 z-10 backdrop-blur-md">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                                </div>
                                <div className="mx-auto px-4 py-1 rounded-full bg-white/5 text-[10px] text-slate-500 font-mono tracking-widest hidden sm:block">
                                    dr.manal.net
                                </div>
                            </div>

                            {/* Dashboard Image */}
                            <Image
                                src="/HERO.webp"
                                alt="Platform Dashboard"
                                width={1600}
                                height={900}
                                className="object-cover w-full h-full pt-10 opacity-80 group-hover:opacity-100 duration-700 group-hover:scale-105 transition-all"
                                priority
                            />

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent z-0"></div>
                        </div>

                        {/* Floating Tech Icons (Decorative) */}
                        <motion.div
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-12 -left-8 md:top-24 md:-left-16 p-3 bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl hidden lg:block"
                        >
                            <Link href="/">
                                <Image
                                    src="/prince-sultan-university-seeklogo.png"
                                    alt="Prince Sultan University"
                                    width={64}
                                    height={64}
                                    className="w-16 h-16 object-contain"
                                />
                            </Link>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 20, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -top-8 -right-8 md:top-20 md:-right-12 p-3 bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl hidden lg:block"
                        >
                            <Link href="/">
                                <Image
                                    src="/king-saud-university-seeklogo.png"
                                    alt="King Saud University"
                                    width={64}
                                    height={64}
                                    className="w-16 h-16 object-contain"
                                />
                            </Link>
                        </motion.div>

                        {/* Bottom Glow */}
                        <div className="absolute -inset-4 bg-indigo-500/20 rounded-[2.5rem] blur-3xl -z-10 opacity-50"></div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

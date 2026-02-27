'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { University } from '@/lib/api/types';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { Building2, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { motion } from 'framer-motion';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 20 } }
} as const;

export function UniversitiesGrid() {
    const t = useTranslations('public.home');
    const { data: universities = [], isLoading } = useQuery({
        queryKey: ['universities'],
        queryFn: async () => {
            const { data } = await apiClient.get('/catalog/universities');
            return data.data as University[];
        },
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-40 rounded-3xl bg-slate-50 dark:bg-white/5 animate-pulse border border-slate-200 dark:border-white/10"></div>
                ))}
            </div>
        );
    }

    if (universities.length === 0) return null;

    return (
        <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
            {universities.map(university => (
                <motion.div variants={item} key={university.id} className="relative z-10 h-full">
                    <Link
                        href={`/universities/${university.id}`}
                        className="group relative grid h-[248px] grid-rows-[auto_1fr_auto] items-center justify-items-center rounded-4xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 text-center transition-all hover:-translate-y-2 hover:bg-slate-50 dark:hover:bg-white/10 hover:shadow-md hover:shadow-slate-100 dark:hover:shadow-indigo-500/20 sm:h-[264px] sm:p-6"
                    >
                        <div className="relative aspect-square mb-4 flex h-28 w-28 items-center justify-center rounded-3xl bg-white/95 p-3 shadow-lg transition-transform duration-300 group-hover:scale-105 sm:mb-5 sm:h-32 sm:w-32">
                            {(university.logoUrl || university.logo) ? (
                                <Image
                                    src={university.logoUrl || university.logo || ''}
                                    alt={university.name}
                                    width={120}
                                    height={120}
                                    sizes="120px"
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                <Building2 className="h-12 w-12 text-indigo-600" />
                            )}
                        </div>

                        <h3 className="mb-3 line-clamp-2 min-h-[3.5rem] text-base font-bold leading-7 text-slate-900 dark:text-white transition-colors group-hover:text-indigo-600 dark:group-hover:text-amber-400 sm:text-lg">
                            {university.name}
                        </h3>

                        <span className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 transition-colors group-hover:text-indigo-600 dark:group-hover:text-white">
                            {t('universities_explore')} <ArrowRight className="w-3 h-3 group-hover:translate-x-[-4px] transition-transform rtl:group-hover:translate-x-[4px]" />
                        </span>

                        {/* Hover Gradient */}
                        <div className="absolute inset-0 rounded-4xl bg-linear-to-tr from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    </Link>
                </motion.div>
            ))}
        </motion.div>
    );
}

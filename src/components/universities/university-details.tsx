'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { University, Course } from '@/lib/api/types';
import { GraduationCap, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { CourseCard } from '@/components/courses/course-card';
import { CourseCardSkeleton } from '@/components/courses/course-card-skeleton';
import { useTranslations } from 'next-intl';

interface UniversityDetailsProps {
    universityId: string;
    initialUniversity: University;
}

// Phase 8: V2 Simplification - Direct University → Courses (No Major/Subject layer)
export function UniversityDetails({ universityId, initialUniversity }: UniversityDetailsProps) {
    const t = useTranslations('courses');
    
    // Fetch Courses directly for university (public endpoint)
    const { data: courses, isLoading: loadingCourses } = useQuery({
        queryKey: ['university-public-courses', universityId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/catalog/universities/${universityId}/public-courses`);
            return data.data as Course[];
        }
    });

    return (
        <div className="space-y-12">
            {/* Header / Hero */}
            <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-8 lg:p-12 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl opacity-[0.08] dark:opacity-100"></div>
                <div className="relative z-10 flex flex-col items-center gap-8 lg:flex-row">
                    <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-white p-2">
                        {(initialUniversity.logoUrl || initialUniversity.logo) ? (
                            <Image
                                src={initialUniversity.logoUrl || initialUniversity.logo || ''}
                                alt={initialUniversity.name}
                                fill
                                sizes="96px"
                                className="object-contain p-2"
                            />
                        ) : (
                            <GraduationCap className="h-full w-full text-slate-400" />
                        )}
                    </div>
                    <div className="text-center lg:text-right">
                        <h1 className="text-3xl font-extrabold lg:text-5xl">{initialUniversity.name}</h1>
                        <p className="mt-4 text-slate-500 dark:text-slate-400">{t('university_subtitle')}</p>
                    </div>
                </div>
            </div>

            {/* Courses Grid - Direct display without Major/Subject selection */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{t('available_courses')}</h2>
                    <span className="rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-1 text-sm text-slate-500 dark:text-slate-400">
                        {courses?.length || 0} {t('course_count_suffix')}
                    </span>
                </div>

                {loadingCourses ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <CourseCardSkeleton key={i} />
                        ))}
                    </div>
                ) : courses?.length === 0 ? (
                    <div className="flex h-64 items-center justify-center rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                        {t('no_university_courses')}
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {courses?.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

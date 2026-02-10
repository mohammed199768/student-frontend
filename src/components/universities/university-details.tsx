'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { University, Course } from '@/lib/api/types';
import { GraduationCap, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { CourseCard } from '@/components/courses/course-card';
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
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 lg:p-12 text-white">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl"></div>
                <div className="relative z-10 flex flex-col items-center gap-8 lg:flex-row">
                    <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-white p-2">
                        {(initialUniversity.logoUrl || initialUniversity.logo) ? (
                            <Image
                                src={initialUniversity.logoUrl || initialUniversity.logo || ''}
                                alt={initialUniversity.name}
                                fill
                                className="object-contain p-2"
                            />
                        ) : (
                            <GraduationCap className="h-full w-full text-slate-400" />
                        )}
                    </div>
                    <div className="text-center lg:text-right">
                        <h1 className="text-3xl font-black lg:text-5xl">{initialUniversity.name}</h1>
                        <p className="mt-4 text-slate-400">{t('university_subtitle')}</p>
                    </div>
                </div>
            </div>

            {/* Courses Grid - Direct display without Major/Subject selection */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-white">{t('available_courses')}</h2>
                    <span className="rounded-full bg-white/5 px-4 py-1 text-sm text-slate-400">
                        {courses?.length || 0} {t('course_count_suffix')}
                    </span>
                </div>

                {loadingCourses ? (
                    <div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin text-indigo-500" /></div>
                ) : courses?.length === 0 ? (
                    <div className="flex h-64 items-center justify-center rounded-3xl bg-slate-900/50 text-slate-500">
                        {t('no_university_courses')}
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {courses?.map((course) => (
                            <CourseCard key={course.id} course={course} variant="dark" />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

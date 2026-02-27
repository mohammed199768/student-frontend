'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import { apiClient } from '@/lib/api/client';
import { Course, Progress } from '@/lib/api/types';
import { Link } from '@/i18n/routing';
import { useQuery } from '@tanstack/react-query';
import {
    BookOpen,
    Search
} from 'lucide-react';
import { Navbar } from '@/components/common/navbar';
import { Footer } from '@/components/common/footer';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { useTranslations } from 'next-intl';

export default function DashboardPage() {
    const { user } = useAuth();
    const t = useTranslations('student.dashboard');

    const { data: courses = [], isLoading } = useQuery({
        queryKey: ['my-courses'],
        queryFn: async () => {
            const { data } = await apiClient.get('/students/me/courses');
            return data.data as (Course & { progress: Progress })[];
        },
    });

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
            <Navbar />

            <main className="flex-1 py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">{t('welcome_user', { name: user?.fullName?.split(' ')[0] || '' })} 👋</h1>
                            <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">{t('welcome_subtitle')}</p>
                        </div>

                        <div className="flex divide-x divide-slate-100 dark:divide-slate-800 rtl:divide-x-reverse rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-2 shadow-sm">
                            <div className="px-6 py-2 text-center">
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{courses.length}</p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('stat_enrolled')}</p>
                            </div>
                            <div className="px-6 py-2 text-center">
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{courses.filter(c => c.progress?.percentage === 100).length}</p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('stat_completed')}</p>
                            </div>
                        </div>
                    </div>


                    <div className="grid grid-cols-1 gap-12">
                        {/* Courses List */}
                        <div className="w-full">
                            <div className="mb-8 flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('my_courses')}</h2>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400 rtl:right-3 rtl:left-auto" />
                                    <input
                                        type="text"
                                        placeholder={t('search_placeholder')}
                                        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 py-2 pl-9 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none rtl:pr-9 rtl:pl-4"
                                    />
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-64 rounded-3xl bg-white dark:bg-slate-800/50 shadow-sm animate-pulse"></div>
                                    ))}
                                </div>
                            ) : courses.length > 0 ? (
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                    {courses.map((course) => (
                                        <div key={course.id} className="group overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md transition-all">
                                            <div className="relative aspect-video overflow-hidden">
                                                {/* Placeholder Box - No Images Policy */}
                                                <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-indigo-600 to-indigo-800 transition-all group-hover:from-indigo-500 group-hover:to-indigo-700">
                                                    <h3 className="text-white dark:text-white font-bold text-lg text-center px-4 line-clamp-2 drop-shadow-md">
                                                        {course.title}
                                                    </h3>
                                                </div>
                                                <div className="absolute bottom-4 right-4 left-4 z-10">
                                                    <div className="flex items-center gap-2 text-xs text-white dark:text-white font-medium lowercase">
                                                        <ProgressBar value={course.progress?.percentage || 0} className="h-1.5 flex-1 bg-white/20" />
                                                        <span>{course.progress?.percentage || 0}% {t('completed')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-6 flex items-center justify-between">
                                                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 font-medium">
                                                    <BookOpen className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                                                    <span>{t('lesson_count', { current: course.progress?.completedLessonIds?.length || 0, total: course.progress?.totalLessons || 0 })}</span>
                                                </div>
                                                <Link
                                                    href={`/learn/${course.id}`}
                                                    className="rounded-xl bg-slate-100 dark:bg-slate-900 px-6 py-2.5 text-sm font-bold text-slate-800 dark:text-white transition-all hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600"
                                                >
                                                    {t('continue_learning')}
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex h-96 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-8 text-center">
                                    <BookOpen className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-6" />
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('no_courses_title')}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">{t('no_courses_desc')}</p>
                                    <Link
                                        href="/courses"
                                        className="rounded-2xl bg-indigo-600 px-8 py-4 font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700"
                                    >
                                        {t('browse_courses')}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}


'use client';

import { useState, useMemo } from 'react';
import { Link } from '@/i18n/routing';
import { BookOpen, Users, Search, Play } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export interface TrailerCourse {
    id: string;
    title: string;
    thumbnail?: string | null;
    description?: string | null;
    price: string | number;
    university?: { id: string; name: string; logo?: string | null } | null;
    _count?: { enrollments?: number; lectures?: number };
}

export function TrailerListClient({
    courses,
    isArabic,
}: {
    courses: TrailerCourse[];
    isArabic: boolean;
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUniversity, setSelectedUniversity] = useState<string>('all');

    // Extract unique universities from the courses
    const universities = useMemo(() => {
        const uniMap = new Map<string, string>();
        courses.forEach(course => {
            if (course.university?.id && course.university?.name) {
                uniMap.set(course.university.id, course.university.name);
            }
        });
        return Array.from(uniMap.entries()).map(([id, name]) => ({ id, name }));
    }, [courses]);

    // Filter courses based on search query and selected university
    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
            const matchesUni = selectedUniversity === 'all' || course.university?.id === selectedUniversity;
            return matchesSearch && matchesUni;
        });
    }, [courses, searchQuery, selectedUniversity]);

    return (
        <div className="space-y-8">
            {/* ─── Search & Filters ─── */}
            <div className="mx-auto max-w-4xl rounded-2xl bg-white p-4 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] dark:bg-slate-900 border border-slate-100 dark:border-white/5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Search Input */}
                    <div className="group relative flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 rtl:left-auto rtl:right-0 rtl:pl-0 rtl:pr-4">
                            <Search className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full rounded-xl border-0 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-slate-800/50 dark:text-white dark:ring-white/10 focus:dark:bg-slate-900 focus:dark:ring-indigo-500 rtl:pl-4 rtl:pr-11 sm:text-sm sm:leading-6"
                            placeholder={isArabic ? 'ابحث عن دورة، مادة، أو وصف...' : 'Search for a course, subject, or description...'}
                        />
                    </div>

                    {/* University Filter */}
                    {universities.length > 0 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                            <button
                                onClick={() => setSelectedUniversity('all')}
                                className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${selectedUniversity === 'all'
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
                                    }`}
                            >
                                {isArabic ? 'الكل' : 'All Universities'}
                            </button>
                            {universities.map(uni => (
                                <button
                                    key={uni.id}
                                    onClick={() => setSelectedUniversity(uni.id)}
                                    className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${selectedUniversity === uni.id
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
                                        }`}
                                >
                                    {uni.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Results Info ─── */}
            <div className="flex items-center justify-between text-sm font-medium text-slate-500 dark:text-slate-400">
                <span>
                    {isArabic ? 'النتائج:' : 'Results:'} <span className="font-bold text-slate-900 dark:text-white">{filteredCourses.length}</span>
                </span>
                {searchQuery && (
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedUniversity('all');
                        }}
                        className="text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                        {isArabic ? 'مسح الفلاتر' : 'Clear filters'}
                    </button>
                )}
            </div>

            {/* ─── Course Grid ─── */}
            {filteredCourses.length === 0 ? (
                <div className="py-20 text-center">
                    <BookOpen className="mx-auto mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" />
                    <p className="text-lg font-medium text-slate-900 dark:text-white">
                        {isArabic ? 'لم نجد أي نتائج متطابقة.' : 'No matching results found.'}
                    </p>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">
                        {isArabic ? 'جرب البحث بكلمات مختلفة أو إزالة الفلاتر.' : 'Try adjusting your search or filters.'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredCourses.map((course) => (
                        <Link
                            key={course.id}
                            href={`/trailer/${course.id}`}
                            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-slate-900"
                        >
                            <div className="flex h-44 items-center justify-center bg-linear-to-br from-indigo-500 via-indigo-600 to-violet-700 p-6 text-center text-white relative">
                                <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity group-hover:opacity-100" />
                                <h2 className="line-clamp-3 text-xl font-bold leading-tight">{course.title}</h2>
                            </div>

                            <div className="space-y-4 p-5">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded inline-block">
                                        {course.university?.name || 'University'}
                                    </p>
                                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                                        {formatPrice(Number(course.price))}
                                    </span>
                                </div>

                                <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                                    {course.description || (isArabic
                                        ? 'يتوفر عرض تعريفي مجاني لمحتوى هذه الدورة.'
                                        : 'Course trailer content is available for preview.')}
                                </p>

                                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                        <Users className="h-4 w-4" />
                                        <span>{course._count?.enrollments ?? 0} {isArabic ? 'طلاب' : 'Students'}</span>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 group-hover:dark:text-indigo-300 transition-colors">
                                        <Play className="h-4 w-4 fill-current" />
                                        {isArabic ? 'مشاهدة العرض' : 'Watch Preview'}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

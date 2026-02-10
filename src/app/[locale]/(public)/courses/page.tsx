import { Navbar } from '@/components/common/navbar';
import { Footer } from '@/components/common/footer';
import { CourseCard } from '@/components/courses/course-card';
import { apiClient } from '@/lib/api/client';
import { Course, University } from '@/lib/api/types';
import { Search, SlidersHorizontal } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

interface CoursesPageProps {
    searchParams: Promise<{
        q?: string;
        universityId?: string;
        majorId?: string;
        subjectId?: string;
    }>;
}

async function getData(params: { q?: string; universityId?: string; majorId?: string; subjectId?: string }) {
    try {
        const [universitiesRes, coursesRes] = await Promise.all([
            apiClient.get('/catalog/universities'),
            apiClient.get('/catalog/courses', { params })
        ]);

        console.log('Universities Data:', JSON.stringify(universitiesRes.data, null, 2));
        console.log('Courses Data:', JSON.stringify(coursesRes.data, null, 2));

        return {
            universities: (universitiesRes.data.data as University[]) || [],
            courses: (coursesRes.data.data.courses as Course[]) || []
        };
    } catch (error) {
        console.error('Failed to fetch data', error);
        return { universities: [], courses: [] };
    }
}

export const dynamic = 'force-dynamic';

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
    const { q, universityId, majorId, subjectId } = await searchParams;
    const { universities, courses } = await getData({ q, universityId, majorId, subjectId });
    const t = await getTranslations('courses');
    const tc = await getTranslations('common');

    // Note: Filtering logic should ideally be on backend, but we'll show the UI here
    // In a real scenario, we would refetch when searchParams change (handled by Next.js RSC)

    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <Navbar />

            <main className="flex-1 py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-12">
                        <h1 className="text-4xl font-extrabold text-slate-900">{t('page_title')}</h1>
                        <p className="mt-4 text-lg text-slate-600">{t('page_subtitle')}</p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Filters - Sidebar */}
                        <aside className="w-full lg:w-72 shrink-0">
                            <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center">
                                        <SlidersHorizontal className="mr-2 h-5 w-5" />
                                        {t('filter_title')}
                                    </h3>
                                </div>

                                <div className="space-y-8">
                                    {/* Search */}
                                    <div>
                                        <label className="text-sm font-bold text-slate-900 mb-3 block">{t('search_label')}</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder={t('search_placeholder')}
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm focus:border-indigo-600 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* University */}
                                    <div>
                                        <label className="text-sm font-bold text-slate-900 mb-3 block">{t('university_label')}</label>
                                        <select className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:border-indigo-600 focus:outline-none">
                                            <option value="">{t('all_universities')}</option>
                                            {universities.map(uni => (
                                                <option key={uni.id} value={uni.id}>{uni.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Major */}
                                    <div>
                                        <label className="text-sm font-bold text-slate-900 mb-3 block">{t('major_label')}</label>
                                        <select className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm focus:border-indigo-600 focus:outline-none">
                                            <option value="">{t('all_majors')}</option>
                                            {/* Cascading logic would be here */}
                                        </select>
                                    </div>

                                    {/* Price range mockup */}
                                    <div>
                                        <label className="text-sm font-bold text-slate-900 mb-3 block">{t('price_label')}</label>
                                        <div className="space-y-2">
                                            <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                                                <input type="checkbox" className="rounded text-indigo-600" />
                                                <span className="text-sm text-slate-600">{tc('free')}</span>
                                            </label>
                                            <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                                                <input type="checkbox" className="rounded text-indigo-600" />
                                                <span className="text-sm text-slate-600">{tc('paid')}</span>
                                            </label>
                                        </div>
                                    </div>

                                    <button className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700">
                                        {t('apply_filter')}
                                    </button>
                                </div>
                            </div>
                        </aside>

                        {/* Courses Grid */}
                        <div className="flex-1">
                            {courses.length > 0 ? (
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {courses.map(course => (
                                        <CourseCard key={course.id} course={course} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex h-96 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white">
                                    <Search className="h-12 w-12 text-slate-300 mb-4" />
                                    <p className="text-lg font-bold text-slate-500">{t('no_results_title')}</p>
                                    <button className="mt-4 text-indigo-600 font-bold hover:underline">{t('reset_filter')}</button>
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

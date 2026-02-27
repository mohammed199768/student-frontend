import { Navbar } from '@/components/common/navbar';
import { Footer } from '@/components/common/footer';
import { CourseCard } from '@/components/courses/course-card';
import { Course, University } from '@/lib/api/types';
import { Link } from '@/i18n/routing';
import { Search } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

interface CoursesPageProps {
    searchParams: Promise<{
        universityId?: string;
    }>;
}

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '');

async function getData(universityId?: string) {
    try {
        if (!PUBLIC_API_BASE_URL) {
            throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined');
        }

        const coursesQuery = universityId ? `?universityId=${encodeURIComponent(universityId)}` : '';
        const [universitiesRes, coursesRes] = await Promise.all([
            fetch(`${PUBLIC_API_BASE_URL}/catalog/universities`, {
                next: { revalidate: 60 },
            }),
            fetch(`${PUBLIC_API_BASE_URL}/catalog/courses${coursesQuery}`, {
                next: { revalidate: 60 },
            }),
        ]);

        if (!universitiesRes.ok || !coursesRes.ok) {
            throw new Error('Failed to fetch courses page data');
        }

        const [universitiesJson, coursesJson] = await Promise.all([
            universitiesRes.json(),
            coursesRes.json(),
        ]);

        return {
            universities: (universitiesJson.data as University[]) || [],
            courses: (coursesJson.data?.courses as Course[]) || []
        };
    } catch (error) {
        console.error('Failed to fetch data', error);
        return { universities: [], courses: [] };
    }
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
    const { universityId } = await searchParams;
    const { universities, courses } = await getData(universityId);
    const t = await getTranslations('courses');

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
            <Navbar />

            <main className="flex-1 py-12 pb-24 md:pb-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-10">
                        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">{t('page_title')}</h1>
                        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{t('page_subtitle')}</p>
                    </div>

                    <section className="mb-8 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-5 shadow-sm">
                        <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-white">{t('university_label')}</h3>
                        <div className="flex flex-wrap gap-2">
                            <Link
                                href="/courses"
                                prefetch={false}
                                className={`rounded-full px-4 py-2 text-sm font-bold transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${!universityId
                                    ? 'border border-indigo-600 bg-indigo-600 text-white'
                                    : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 hover:border-indigo-300 dark:hover:bg-slate-600 hover:text-indigo-600'
                                    }`}
                            >
                                {t('all_universities')}
                            </Link>
                            {universities.map((uni) => (
                                <Link
                                    key={uni.id}
                                    href={`/courses?universityId=${uni.id}`}
                                    prefetch={false}
                                    className={`rounded-full px-4 py-2 text-sm font-bold transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${universityId === uni.id
                                        ? 'border border-indigo-600 bg-indigo-600 text-white'
                                        : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 hover:border-indigo-300 dark:hover:bg-slate-600 hover:text-indigo-600'
                                        }`}
                                >
                                    {uni.name}
                                </Link>
                            ))}
                        </div>
                    </section>

                    <div className="flex-1">
                        {courses.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {courses.map(course => (
                                    <CourseCard key={course.id} course={course} />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 shadow-sm flex flex-col items-center justify-center py-16 px-4 text-center">
                                <Search className="mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" />
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No courses available yet</h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">Please try another filter.</p>
                                <Link 
                                    href="/courses" 
                                    className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-500 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                                    prefetch={false}
                                >
                                    Clear filters
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

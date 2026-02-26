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
        <div className="flex min-h-screen flex-col bg-slate-50">
            <Navbar />

            <main className="flex-1 py-12 pb-24 md:pb-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-10">
                        <h1 className="text-4xl font-extrabold text-slate-900">{t('page_title')}</h1>
                        <p className="mt-4 text-lg text-slate-600">{t('page_subtitle')}</p>
                    </div>

                    <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-4 text-base font-bold text-slate-900">{t('university_label')}</h3>
                        <div className="flex flex-wrap gap-2">
                            <Link
                                href="/courses"
                                className={`rounded-full border px-4 py-2 text-sm font-bold transition-colors ${!universityId
                                    ? 'border-indigo-600 bg-indigo-600 text-white'
                                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                                    }`}
                            >
                                {t('all_universities')}
                            </Link>
                            {universities.map((uni) => (
                                <Link
                                    key={uni.id}
                                    href={`/courses?universityId=${uni.id}`}
                                    className={`rounded-full border px-4 py-2 text-sm font-bold transition-colors ${universityId === uni.id
                                        ? 'border-indigo-600 bg-indigo-600 text-white'
                                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
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
                            <div className="flex h-96 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white">
                                <Search className="mb-4 h-12 w-12 text-slate-300" />
                                <p className="text-lg font-bold text-slate-500">{t('no_results_title')}</p>
                                <Link href="/courses" className="mt-4 text-indigo-600 font-bold hover:underline">
                                    {t('reset_filter')}
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

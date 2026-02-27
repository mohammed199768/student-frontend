import { Link } from '@/i18n/routing';
import { Navbar } from '@/components/common/navbar';
import { Footer } from '@/components/common/footer';
import { CourseCard } from '@/components/courses/course-card';
import { Course } from '@/lib/api/types';
import { ArrowRight, BookOpen } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { UniversitiesGrid } from '@/components/marketing/universities-grid';

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '');

async function getFeaturedCourses(): Promise<Course[]> {
    try {
        if (!PUBLIC_API_BASE_URL) {
            throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined');
        }

        // 1. Try fetching featured courses
        const featuredRes = await fetch(`${PUBLIC_API_BASE_URL}/catalog/courses?isFeatured=true&limit=4`, {
            next: { revalidate: 60 },
        });
        if (!featuredRes.ok) {
            throw new Error('Failed to fetch featured courses');
        }
        const featuredJson = await featuredRes.json();
        if (featuredJson.data?.courses?.length > 0) {
            return featuredJson.data.courses;
        }

        // 2. Fallback: Fetch any 4 newest courses
        const latestRes = await fetch(`${PUBLIC_API_BASE_URL}/catalog/courses?limit=4&sort=latest`, {
            next: { revalidate: 60 },
        });
        if (!latestRes.ok) {
            throw new Error('Failed to fetch latest courses');
        }
        const latestJson = await latestRes.json();
        return latestJson.data?.courses || [];
    } catch (error) {
        console.error('Failed to fetch featured courses', error);
        return [];
    }
}

import { BackgroundWrapper } from '@/components/marketing/background-wrapper';
import { HeroSection } from '@/components/marketing/hero-section';

// ... (getFeaturedCourses function remains same)

export default async function HomePage() {
    const courses = await getFeaturedCourses();
    const t = await getTranslations('public.home');

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-slate-900 relative">
            <BackgroundWrapper />
            <div className="relative z-10 flex min-h-screen flex-col">
                <Navbar />

                <main className="flex-1">
                    {/* Hero Section */}
                    <HeroSection />

                    {/* Universities Section (Premium Design) */}
                    <section className="py-24 relative overflow-hidden">


                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">{t('universities_title')}</h2>
                                <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                                    {t('universities_desc')}
                                </p>
                            </div>

                            <UniversitiesGrid />
                        </div>
                    </section>

                    {/* Featured Courses */}
                    <section className="relative py-24 z-10">
                        {/* Grid Pattern 2 */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none opacity-0 dark:opacity-100"></div>

                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                            <div className="flex items-end justify-between mb-12">
                                <div>
                                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
                                        <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-indigo-400 dark:from-indigo-400 dark:to-cyan-400">
                                            {t('featured_title')}
                                        </span>
                                    </h2>
                                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">{t('featured_subtitle')}</p>
                                </div>
                                <Link href="/courses" className="hidden sm:inline-flex items-center text-indigo-400 font-bold hover:text-indigo-300 hover:underline">
                                    {t('view_all_courses')} <ArrowRight className="ml-2 h-4 w-4 rtl:rotate-180" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                                {courses.length > 0 ? (
                                    courses.map((course) => (
                                        <CourseCard key={course.id} course={course} />
                                    ))
                                ) : (
                                    <div className="col-span-full py-16 text-center bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm backdrop-blur-sm">
                                        <BookOpen className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('no_courses')}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-2">{t('no_courses_desc')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                </main>

                <Footer />
            </div>
        </div>
    );
}

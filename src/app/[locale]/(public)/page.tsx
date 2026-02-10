import { Link } from '@/i18n/routing';
import { Navbar } from '@/components/common/navbar';
import { Footer } from '@/components/common/footer';
import { CourseCard } from '@/components/courses/course-card';
import { apiClient } from '@/lib/api/client';
import { Course } from '@/lib/api/types';
import { ArrowRight, BookOpen } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { UniversitiesGrid } from '@/components/marketing/universities-grid';

async function getFeaturedCourses(): Promise<Course[]> {
    try {
        // 1. Try fetching featured courses
        const { data } = await apiClient.get('/catalog/courses?isFeatured=true&limit=4');
        if (data.data.courses?.length > 0) {
            return data.data.courses;
        }

        // 2. Fallback: Fetch any 4 newest courses
        const { data: fallbackData } = await apiClient.get('/catalog/courses?limit=4&sort=latest');
        return fallbackData.data.courses || [];
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
        <div className="flex min-h-screen flex-col bg-slate-900 relative">
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
                                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">{t('universities_title')}</h2>
                                <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
                                    {t('universities_desc')}
                                </p>
                            </div>

                            <UniversitiesGrid />
                        </div>
                    </section>

                    {/* Featured Courses */}
                    <section className="relative py-24 z-10">
                        {/* Grid Pattern 2 */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none"></div>

                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                            <div className="flex items-end justify-between mb-12">
                                <div>
                                    <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                                        <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-cyan-400">
                                            {t('featured_title')}
                                        </span>
                                    </h2>
                                    <p className="mt-4 text-lg text-slate-400">{t('featured_subtitle')}</p>
                                </div>
                                <Link href="/courses" className="hidden sm:inline-flex items-center text-indigo-400 font-bold hover:text-indigo-300 hover:underline">
                                    {t('view_all_courses')} <ArrowRight className="ml-2 h-4 w-4 rtl:rotate-180" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                                {courses.length > 0 ? (
                                    courses.map((course) => (
                                        <CourseCard key={course.id} course={course} variant="dark" />
                                    ))
                                ) : (
                                    <div className="col-span-full py-16 text-center bg-white/5 rounded-3xl border border-dashed border-white/10 backdrop-blur-sm">
                                        <BookOpen className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-white">{t('no_courses')}</h3>
                                        <p className="text-slate-400 max-w-sm mx-auto mt-2">{t('no_courses_desc')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Learning Journey CTA */}
                    <section className="py-24 relative overflow-hidden">


                        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center">
                            <h2 className="text-4xl font-extrabold mb-8 text-white capitalize">{t('cta_title')}</h2>
                            <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto">
                                {t('cta_desc')}
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link
                                    href="/register"
                                    className="rounded-full bg-white px-10 py-5 text-xl font-bold text-indigo-600 transition-all hover:bg-slate-100 hover:scale-105 active:scale-95 shadow-xl shadow-white/10"
                                >
                                    {t('cta_button_primary')}
                                </Link>
                                <Link
                                    href="/about"
                                    className="rounded-full border border-white/20 bg-white/5 backdrop-blur-sm px-10 py-5 text-xl font-bold text-white transition-all hover:bg-white/10 active:scale-95"
                                >
                                    {t('cta_button_secondary')}
                                </Link>
                            </div>
                        </div>
                    </section>
                </main>

                <Footer />
            </div>
        </div>
    );
}

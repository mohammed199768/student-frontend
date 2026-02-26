import { Link } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { Play, Lock, Globe, Star, CheckCircle, Clock, BookOpen, User } from 'lucide-react';
import { CoursePreviewPlayer } from '@/components/courses/course-preview-player';
import { Navbar } from '@/components/common/navbar';
import { getTranslations } from 'next-intl/server';
import { formatPrice, withLatinDigits } from '@/lib/utils';

interface PageProps {
    params: Promise<{
        courseId: string;
        locale: string;
    }>;
}

export default async function CourseDetailPage({ params }: PageProps) {
    const { courseId, locale } = await params;
    const t = await getTranslations('courses');
    const ct = await getTranslations('common');

    // Fetch Course Details from Backend Public API
    let course;
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/catalog/courses/${courseId}`, {
            next: { revalidate: 60 },
        });

        if (!res.ok) {
            if (res.status === 404) notFound();
            throw new Error('Failed to fetch course');
        }

        const json = await res.json();
        course = json.data;
    } catch (error) {
        console.error("Error fetching course:", error);
        notFound(); // Fallback to 404 for now
    }

    if (!course) return notFound();

    return (
        <div className="min-h-screen bg-slate-950 pb-24 md:pb-20">
            <Navbar />
            {/* --- Hero Section --- */}
            <div className="relative bg-slate-900 border-b border-white/5 pt-12 pb-12 lg:pt-20 lg:pb-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-12 gap-12">
                        {/* Left Column (Content) */}
                        <div className="lg:col-span-8 space-y-8 order-2 lg:order-1">
                            {/* Breadcrumb / Badge */}
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <Link href="/courses" className="hover:text-white transition-colors">الدورات</Link>
                                <span>/</span>
                                <span className="text-indigo-400">{course.subject?.major?.name || 'General'}</span>
                                {course.isFeatured && (
                                    <span className="mr-auto lg:mr-4 inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-500">
                                        <Star className="w-3 h-3 fill-current" />
                                        مميز
                                    </span>
                                )}
                            </div>

                            {/* Title & Description */}
                            <div>
                                <h1 className="text-3xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                                    {course.title}
                                </h1>
                                <p className="text-lg text-slate-300 leading-relaxed max-w-3xl">
                                    {course.description || "No description available."}
                                </p>
                            </div>

                            {/* Meta Stats */}
                            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span>{course.instructor?.firstName} {course.instructor?.lastName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    <span>العربية</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>آخر تحديث: {new Date(course.updatedAt).toLocaleDateString(withLatinDigits(locale))}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Main Content Split --- */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 lg:-mt-20 relative z-10">
                <div className="grid lg:grid-cols-12 gap-12">

                    {/* Right Column (Sticky Card) - Enrolls & Video */}
                    <div className="lg:col-span-4 lg:start-9 order-1 lg:order-2">
                        <div className="sticky top-24 space-y-6">
                            {/* Course Enrollment Card */}
                            <div className="bg-slate-900 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                                {/* Preview Video / Thumbnail */}
                                <CoursePreviewPlayer
                                    title={course.title}
                                    trailerId={course.trailerAsset?.bunnyVideoId}
                                />

                                {/* Card Body */}
                                <div className="p-6">
                                    <div className="flex items-baseline gap-2 mb-6">
                                        <span className="text-3xl font-bold text-white">
                                            {formatPrice(Number(course.price))}
                                        </span>
                                        {course.salePrice && (
                                            <span className="text-lg text-slate-500 line-through decoration-slate-500">
                                                {formatPrice(Number(course.salePrice))}
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <Link
                                            href={`/enroll/${course.id}`}
                                            className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-center transition-colors shadow-lg shadow-indigo-600/20"
                                        >
                                            اشترك الآن
                                        </Link>
                                        <p className="text-xs text-center text-slate-400">
                                            ضمان استرجاع الأموال لمدة 30 يوماً
                                        </p>
                                    </div>

                                    <div className="mt-8 space-y-4">
                                        <h4 className="font-bold text-white text-sm">ماذا يغطي هذا الكورس:</h4>
                                        <ul className="space-y-3">
                                            <li className="flex gap-3 text-sm text-slate-300">
                                                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                                <span>وصول كامل مدى الحياة</span>
                                            </li>

                                            <li className="flex gap-3 text-sm text-slate-300">
                                                <BookOpen className="w-4 h-4 text-green-500 shrink-0" />
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                <span>{t('educational_lessons', { count: course.lectures?.reduce((acc: number, l: any) => acc + l.parts.length, 0) || 0 })}</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                                        <button className="text-sm font-bold text-slate-400 hover:text-white transition-colors">مشاركة</button>
                                        <span className="text-xs text-slate-500">كود الدورة: {String(course.id).slice(0, 8)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Left Column (Content Details) */}
                    <div className="lg:col-span-8 space-y-12 order-2 lg:order-1 lg:pt-12">

                        {/* Syllabus / Content */}
                        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 lg:p-8">
                            <h2 className="text-2xl font-bold text-white mb-6">{t('curriculum')}</h2>
                            <div className="flex items-center justify-between text-sm text-slate-400 mb-6">
                                {/* V2 Logic: Count Lectures as Sections, Parts as Lessons */}
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                <span>{course.lectures?.length || 0} {t('sections')} • {course.lectures?.reduce((acc: number, l: any) => acc + l.parts.length, 0) || 0} {t('parts')}</span>
                                {/* Duration is NOT available in V2 Schema yet - hiding or using placeholder as per contract */}
                                <span>{t('total_duration')}: —</span>
                            </div>

                            <div className="space-y-4">
                                {course.lectures?.map((lecture: any) => (
                                    <div key={lecture.id} className="border border-white/5 rounded-xl overflow-hidden bg-slate-950/30">
                                        <div className="bg-slate-900/80 px-4 py-3 border-b border-white/5 flex justify-between items-center">
                                            <h3 className="font-bold text-slate-200">{lecture.title}</h3>
                                            <span className="text-xs text-slate-500">{lecture.parts?.length} {t('lessons')}</span>
                                        </div>
                                        <div className="divide-y divide-white/5">
                                            {lecture.parts?.map((part: any) => {
                                                // V2: Check if part has previewable assets? Schema doesn't expose isPreview on Part yet.
                                                // Defaulting to locked until proven otherwise.
                                                const isPreview = false; 
                                                
                                                return (
                                                    <div key={part.id} className="px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors group">
                                                        <div className="flex items-center gap-3">
                                                            {isPreview ? (
                                                                <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                                                    <Play className="w-3 h-3 fill-current" />
                                                                </div>
                                                            ) : (
                                                                <Lock className="w-4 h-4 text-slate-600" />
                                                            )}
                                                            <span className={isPreview ? "text-slate-200" : "text-slate-400"}>
                                                                {part.title}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs">
                                                            {isPreview && (
                                                                <span className="text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    {t('preview_free')}
                                                                </span>
                                                            )}
                                                            {/* Duration removed - not in schema */}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Instructor */}
                        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 lg:p-8">
                            <h2 className="text-2xl font-bold text-white mb-6">عن المحاضر</h2>
                            <div className="flex items-start gap-6">
                                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-slate-700 shrink-0 bg-indigo-600 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white">
                                        {course.instructor?.firstName?.[0] || 'M'}{course.instructor?.lastName?.[0] || ''}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">
                                        {course.instructor?.firstName} {course.instructor?.lastName}
                                    </h3>
                                    <p className="text-indigo-400 text-sm mb-4">Senior Instructor</p>
                                        <div className="prose prose-sm dark:prose-invert text-slate-400">
                                            {/* Bio from DB */}
                                            {course.instructor?.bio || t('no_bio')}
                                        </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/lib/contexts/auth-context';
import {
    ArrowLeft,
    ChevronDown,
    ChevronRight,
    Lock,
    Play,
    FileText,
    BookOpen,
    ShoppingCart,
    Sparkles,
    Eye,
    GraduationCap,
    Layers,
} from 'lucide-react';
import { Navbar } from '@/components/common/navbar';

interface TrailerData {
    course: {
        id: string;
        title: string;
        description?: string;
        thumbnail?: string;
        price: string | number;
        university?: { name: string; logo?: string };
    };
    trailerLectures: Array<{
        id: string;
        title: string;
        order: number;
        parts: Array<{
            id: string;
            title: string;
            lessons: Array<{
                id: string;
                title: string;
                video: string;
            }>;
            files: Array<{
                id: string;
                title: string;
                type: 'PDF' | 'PPTX';
                storageKey: string;
            }>;
        }>;
    }>;
    courseOutline: Array<{
        id: string;
        title: string;
        order: number;
        _count: { parts: number };
    }>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '');

export default function TrailerCoursePage() {
    const params = useParams();
    const courseId = params.courseId as string;
    const locale = (params.locale as string) || 'en';
    const isArabic = locale === 'ar';
    const { status } = useAuth();

    const [trailer, setTrailer] = useState<TrailerData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const canWatchVideo = status === 'authenticated';
    const [expandedLectureId, setExpandedLectureId] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchPublicTrailer = async () => {
            if (!API_BASE_URL) {
                if (isMounted) {
                    setError(isArabic ? 'إعدادات API غير مكتملة.' : 'Trailer API base URL is not configured.');
                    setIsLoading(false);
                }
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/trailer/${courseId}`, { cache: 'no-store' });
                if (!response.ok) throw new Error('Trailer not found');

                const json = await response.json();
                if (!isMounted) return;

                const nextTrailer = json.data as TrailerData;
                setTrailer(nextTrailer);
                setExpandedLectureId(nextTrailer.trailerLectures?.[0]?.id || null);
            } catch {
                if (isMounted) {
                    setError(isArabic ? 'لا يوجد عرض تعريفي لهذه الدورة حالياً.' : 'This course does not have a trailer yet.');
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchPublicTrailer();
        return () => { isMounted = false; };
    }, [courseId, isArabic]);

    // ── Count total preview items ──
    const totalPreviewItems = trailer?.trailerLectures.reduce((acc, lec) =>
        acc + lec.parts.reduce((a, p) => a + p.lessons.length + p.files.length, 0), 0
    ) ?? 0;

    // ─────────── Loading ───────────
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--bg-base)]">
                <Navbar />
                <div className="flex justify-center py-32">
                    <div className="page-loader__ring" />
                </div>
            </div>
        );
    }

    // ─────────── Error ───────────
    if (error || !trailer) {
        return (
            <div className="min-h-screen bg-[var(--bg-base)]">
                <Navbar />
                <div className="mx-auto max-w-lg px-4 py-32 text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--bg-muted)]">
                        <BookOpen className="h-10 w-10 text-[var(--text-subtle)]" />
                    </div>
                    <p className="text-lg font-semibold text-[var(--text-muted)]">{error || 'Trailer not found'}</p>
                    <Link
                        href={`/courses/${courseId}` as any}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-6 py-3 font-semibold text-white transition-all hover:bg-[var(--brand-hover)] hover:shadow-lg"
                    >
                        {isArabic ? 'العودة للدورة' : 'Back to Course'}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-base)]">
            <Navbar />

            {/* ═══════════════════════════════════════════
                HERO SECTION — gradient banner
               ═══════════════════════════════════════════ */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 dark:from-indigo-900 dark:via-slate-900 dark:to-violet-950">
                {/* Decorative orbs */}
                <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-violet-400/10 blur-3xl" />
                <div className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-300/5 blur-2xl" />

                <div className="relative mx-auto max-w-5xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10">
                    {/* Back link */}
                    <Link href="/trailer" className="group mb-8 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-white/80 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white">
                        <ArrowLeft className="h-4 w-4 rtl:rotate-180 transition-transform group-hover:-translate-x-0.5" />
                        {isArabic ? 'كل العروض التعريفية' : 'All Previews'}
                    </Link>

                    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                        <div className="max-w-2xl space-y-4">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white/90 backdrop-blur-sm">
                                <Sparkles className="h-3 w-3" />
                                {isArabic ? 'عرض تعريفي مجاني' : 'Free Preview'}
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
                                {trailer.course.title}
                            </h1>

                            {/* Description */}
                            {trailer.course.description && (
                                <p className="text-base leading-relaxed text-white/70 sm:text-lg">
                                    {trailer.course.description}
                                </p>
                            )}

                            {/* University badge */}
                            {trailer.course.university && (
                                <div className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white/80 backdrop-blur-sm">
                                    <GraduationCap className="h-4 w-4" />
                                    {trailer.course.university.name}
                                </div>
                            )}

                            {/* Stats */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                                <span className="flex items-center gap-1.5">
                                    <Layers className="h-4 w-4" />
                                    {trailer.courseOutline.length} {isArabic ? 'محاضرات' : 'Lectures'}
                                </span>
                                <span className="h-1 w-1 rounded-full bg-white/30" />
                                <span className="flex items-center gap-1.5">
                                    <Eye className="h-4 w-4" />
                                    {totalPreviewItems} {isArabic ? 'عنصر متاح للمعاينة' : 'Preview Items'}
                                </span>
                            </div>
                        </div>

                        {/* Price card (desktop) */}
                        <div className="hidden sm:block">
                            <div className="rounded-2xl bg-white/10 p-6 text-center backdrop-blur-md border border-white/10">
                                <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                                    {isArabic ? 'سعر الدورة' : 'Course Price'}
                                </p>
                                <p className="mt-1 text-3xl font-black text-white">
                                    {trailer.course.price} <span className="text-base font-semibold text-white/60">SAR</span>
                                </p>
                                <Link
                                    href={`/enroll/${courseId}` as any}
                                    className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-indigo-700 transition-all hover:bg-indigo-50 hover:shadow-lg"
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    {isArabic ? 'اشترك الآن' : 'Enroll Now'}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                MAIN CONTENT
               ═══════════════════════════════════════════ */}
            <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 pb-32 sm:px-6 md:pb-12">

                {/* Sign-in prompt for guests */}
                {!canWatchVideo && (
                    <div className="flex items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-4 dark:border-indigo-500/20 dark:bg-indigo-500/10">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/20">
                            <Lock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
                                {isArabic ? 'سجّل دخولك لمشاهدة المحتوى' : 'Sign in to watch content'}
                            </p>
                            <p className="text-xs text-indigo-700/70 dark:text-indigo-300/60">
                                {isArabic
                                    ? 'يمكنك استعراض العناوين بحرية — سجّل الدخول لتتمكن من المشاهدة.'
                                    : 'Browse all titles freely — sign in to unlock the watch button.'}
                            </p>
                        </div>
                        <Link
                            href="/login"
                            className="shrink-0 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-700 hover:shadow-lg"
                        >
                            {isArabic ? 'دخول' : 'Sign In'}
                        </Link>
                    </div>
                )}

                {/* ── Preview Content Section ── */}
                <section>
                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/10">
                            <Eye className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-[var(--text-base)]">
                                {isArabic ? 'المحتوى المتاح للمعاينة' : 'Preview Content'}
                            </h2>
                            <p className="text-sm text-[var(--text-muted)]">
                                {isArabic
                                    ? 'استكشف محتوى الدورة قبل الاشتراك'
                                    : 'Explore course content before enrolling'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {trailer.trailerLectures.map((lecture, idx) => (
                            <div
                                key={lecture.id}
                                className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-sm transition-all hover:shadow-md"
                            >
                                <button
                                    onClick={() =>
                                        setExpandedLectureId((c) => (c === lecture.id ? null : lecture.id))
                                    }
                                    className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-[var(--bg-muted)]"
                                >
                                    {/* Lecture number badge */}
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-black text-white shadow-md">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-[var(--text-base)] truncate">{lecture.title}</p>
                                        <p className="text-xs text-[var(--text-muted)]">
                                            {lecture.parts.reduce((a, p) => a + p.lessons.length, 0)} {isArabic ? 'فيديو' : 'videos'}
                                            {lecture.parts.reduce((a, p) => a + p.files.length, 0) > 0 && (
                                                <> · {lecture.parts.reduce((a, p) => a + p.files.length, 0)} {isArabic ? 'ملف' : 'files'}</>
                                            )}
                                        </p>
                                    </div>
                                    <div className={`transition-transform duration-200 ${expandedLectureId === lecture.id ? 'rotate-180' : ''}`}>
                                        <ChevronDown className="h-5 w-5 text-[var(--text-subtle)]" />
                                    </div>
                                </button>

                                {/* Expanded content */}
                                {expandedLectureId === lecture.id && (
                                    <div className="border-t border-[var(--border)] bg-[var(--bg-muted)] p-4 space-y-4 animate-fade-in">
                                        {lecture.parts.map((part) => (
                                            <div key={part.id} className="space-y-2">
                                                <p className="ml-1 text-xs font-bold uppercase tracking-wider text-[var(--text-subtle)]">{part.title}</p>

                                                {/* Video lessons */}
                                                {part.lessons.map((lesson) => (
                                                    <div
                                                        key={lesson.id}
                                                        className="group flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3.5 transition-all hover:border-indigo-300 hover:shadow-sm dark:hover:border-indigo-500/30"
                                                    >
                                                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${canWatchVideo
                                                            ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400'
                                                            : 'bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500'
                                                        }`}>
                                                            {canWatchVideo
                                                                ? <Play className="h-3.5 w-3.5" />
                                                                : <Lock className="h-3.5 w-3.5" />
                                                            }
                                                        </div>
                                                        <span className="flex-1 text-sm font-medium text-[var(--text-base)] truncate">{lesson.title}</span>
                                                        {canWatchVideo && (
                                                            <Link
                                                                href={`/trailer/${courseId}/watch` as any}
                                                                className="shrink-0 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white opacity-0 transition-all group-hover:opacity-100 hover:bg-indigo-700"
                                                            >
                                                                {isArabic ? 'مشاهدة' : 'Watch'}
                                                            </Link>
                                                        )}
                                                    </div>
                                                ))}

                                                {/* File assets */}
                                                {part.files.map((file) => (
                                                    <div
                                                        key={file.id}
                                                        className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3.5"
                                                    >
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                                                            <FileText className="h-3.5 w-3.5" />
                                                        </div>
                                                        <span className="flex-1 text-sm font-medium text-[var(--text-base)] truncate">{file.title}</span>
                                                        <span className="rounded-md bg-[var(--bg-muted)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">
                                                            {file.type}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Full Course Outline ── */}
                <section>
                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                            <BookOpen className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-[var(--text-base)]">
                                {isArabic ? 'محتوى الدورة الكامل' : 'Full Course Content'}
                            </h2>
                            <p className="text-sm text-[var(--text-muted)]">
                                {isArabic
                                    ? `${trailer.courseOutline.length} محاضرات — اشترك لفتح المحتوى بالكامل`
                                    : `${trailer.courseOutline.length} lectures — enroll to unlock everything`}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {trailer.courseOutline.map((lecture, idx) => (
                            <div
                                key={lecture.id}
                                className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 transition-colors"
                            >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[var(--text-base)] truncate">{lecture.title}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="rounded-md bg-[var(--bg-muted)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-subtle)]">
                                        {lecture._count.parts} {isArabic ? 'أقسام' : 'parts'}
                                    </span>
                                    <Lock className="h-3.5 w-3.5 text-[var(--text-subtle)]" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Bottom CTA Banner ── */}
                <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-700 p-8 text-center shadow-xl sm:p-10 dark:from-indigo-800 dark:to-violet-900">
                    <Sparkles className="mx-auto mb-4 h-8 w-8 text-white/70" />
                    <h3 className="text-2xl font-black text-white sm:text-3xl">
                        {isArabic ? 'جاهز للبدء في التعلم؟' : 'Ready to start learning?'}
                    </h3>
                    <p className="mx-auto mt-3 max-w-md text-base text-white/70">
                        {isArabic
                            ? 'اشترك الآن واحصل على وصول كامل لجميع المحاضرات والملفات والاختبارات.'
                            : 'Enroll now and get full access to all lectures, files, and quizzes.'}
                    </p>
                    <Link
                        href={`/enroll/${courseId}` as any}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-black text-indigo-700 shadow-lg transition-all hover:bg-indigo-50 hover:shadow-xl"
                    >
                        <ShoppingCart className="h-5 w-5" />
                        {isArabic
                            ? `اشترك الآن — ${trailer.course.price} ريال`
                            : `Enroll Now — ${trailer.course.price} SAR`}
                    </Link>
                </section>
            </div>

            {/* ═══════════════════════════════════════════
                MOBILE STICKY CTA BAR
               ═══════════════════════════════════════════ */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--bg-overlay)] p-3 backdrop-blur-xl sm:hidden">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold text-[var(--text-muted)]">{isArabic ? 'السعر' : 'Price'}</p>
                        <p className="text-lg font-black text-[var(--text-base)]">
                            {trailer.course.price} <span className="text-xs font-semibold text-[var(--text-subtle)]">SAR</span>
                        </p>
                    </div>
                    <Link
                        href={`/enroll/${courseId}` as any}
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-700"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        {isArabic ? 'اشترك الآن' : 'Enroll Now'}
                    </Link>
                </div>
            </div>
        </div>
    );
}

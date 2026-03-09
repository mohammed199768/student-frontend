'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/lib/contexts/auth-context';
import apiClient from '@/lib/api/client';
import { ArrowLeft, ChevronDown, ChevronRight, Lock, Play } from 'lucide-react';
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
    const [canWatchVideo, setCanWatchVideo] = useState(false);
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
                if (!response.ok) {
                    throw new Error('Trailer not found');
                }

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
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchPublicTrailer();
        return () => {
            isMounted = false;
        };
    }, [courseId, isArabic]);

    useEffect(() => {
        // Allow watching if authenticated — backend verifies email on actual video requests
        if (status === 'authenticated') {
            setCanWatchVideo(true);
        } else {
            setCanWatchVideo(false);
        }
    }, [status]);

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (error || !trailer) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-14 text-center">
                <p className="text-gray-500">{error || 'Trailer not found'}</p>
                <Link
                    href={`/courses/${courseId}`}
                    className="mt-4 inline-flex rounded-lg bg-primary px-6 py-2 text-white transition hover:opacity-90"
                >
                    {isArabic ? 'العودة للدورة' : 'Back to Course'}
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            <Navbar />
            <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 pb-28 md:pb-8">
                <Link href="/trailer" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600">
                    <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                    {isArabic ? 'كل العروض التعريفية' : 'All Previews'}
                </Link>

                <div className="space-y-3 rounded-xl border bg-white p-5 dark:bg-slate-900">
                    <h1 className="text-2xl font-bold">{trailer.course.title}</h1>
                    {trailer.course.description && (
                        <p className="text-sm text-gray-500">{trailer.course.description}</p>
                    )}

                    {!canWatchVideo && (
                        <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                            <Lock className="h-4 w-4 shrink-0" />
                            <span>
                                {isArabic
                                    ? 'سجّل الدخول ببريد مفعل لفتح زر المشاهدة.'
                                    : 'Sign in with a verified email to enable Watch.'}
                            </span>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <h2 className="text-lg font-semibold">{isArabic ? 'المحتوى المتاح في العرض' : 'Preview Content'}</h2>
                    {trailer.trailerLectures.map((lecture) => (
                        <div key={lecture.id} className="overflow-hidden rounded-xl border bg-white dark:bg-slate-900">
                            <button
                                onClick={() =>
                                    setExpandedLectureId((current) => (current === lecture.id ? null : lecture.id))
                                }
                                className="flex w-full items-center justify-between p-4 text-left"
                            >
                                <span className="font-semibold">{lecture.title}</span>
                                {expandedLectureId === lecture.id ? (
                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 text-gray-400 rtl:rotate-180" />
                                )}
                            </button>

                            {expandedLectureId === lecture.id && (
                                <div className="space-y-3 border-t p-4">
                                    {lecture.parts.map((part) => (
                                        <div key={part.id} className="space-y-2">
                                            <p className="text-sm font-medium">{part.title}</p>

                                            {part.lessons.map((lesson) => (
                                                <div
                                                    key={lesson.id}
                                                    className="flex items-center gap-3 rounded-lg border p-3 text-sm"
                                                >
                                                    {canWatchVideo ? (
                                                        <Play className="h-4 w-4 text-indigo-600" />
                                                    ) : (
                                                        <Lock className="h-4 w-4 text-gray-400" />
                                                    )}
                                                    <span className="flex-1">{lesson.title}</span>
                                                    {canWatchVideo && (
                                                        <Link
                                                            href={`/learn/${courseId}`}
                                                            className="text-xs font-semibold text-indigo-600 hover:underline"
                                                        >
                                                            {isArabic ? 'مشاهدة' : 'Watch'}
                                                        </Link>
                                                    )}
                                                </div>
                                            ))}

                                            {part.files.map((file) => (
                                                <div
                                                    key={file.id}
                                                    className="flex items-center gap-3 rounded-lg border p-3 text-sm"
                                                >
                                                    <Lock className="h-4 w-4 text-gray-400" />
                                                    <span className="flex-1">{file.title}</span>
                                                    <span className="text-xs text-gray-500">{file.type}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="rounded-xl border bg-gray-50 p-5 dark:bg-slate-900/40">
                    <h3 className="text-lg font-semibold">{isArabic ? 'محتوى الدورة الكامل' : 'Full Course Content'}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {isArabic
                            ? `${trailer.courseOutline.length} محاضرات — اشترك لفتح المحتوى الكامل.`
                            : `${trailer.courseOutline.length} lectures — enroll to unlock everything.`}
                    </p>
                    <div className="mt-4 space-y-2">
                        {trailer.courseOutline.map((lecture) => (
                            <div key={lecture.id} className="flex items-center justify-between rounded-lg border bg-white p-3 text-sm dark:bg-slate-900">
                                <div className="flex items-center gap-2">
                                    <Lock className="h-3.5 w-3.5 text-gray-400" />
                                    <span>{lecture.title}</span>
                                </div>
                                <span className="text-xs text-gray-500">{lecture._count.parts} parts</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="sticky bottom-4">
                    <div className="flex items-center justify-between gap-4 rounded-xl border bg-white p-4 shadow-lg dark:bg-slate-900">
                        <div>
                            <p className="font-semibold">{trailer.course.title}</p>
                            <p className="text-2xl font-bold text-primary">{trailer.course.price} SAR</p>
                        </div>
                        <Link
                            href={`/enroll/${courseId}`}
                            className="inline-flex items-center rounded-lg bg-primary px-6 py-3 font-semibold text-white transition hover:opacity-90"
                        >
                            {isArabic ? 'اشترك الآن' : 'Enroll Now'}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

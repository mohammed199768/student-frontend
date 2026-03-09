'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/lib/contexts/auth-context';
import { apiClient } from '@/lib/api/client';
import {
    ChevronLeft,
    PlayCircle,
    FileText,
    Lock,
    X,
    Menu,
    Presentation,
    ShoppingCart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlayerWrapper } from '@/components/learn/player-wrapper';
import dynamic from 'next/dynamic';

// Lazy load heavy components
const VideoPlayer = dynamic(() => import('@/components/learn/video-player').then(m => m.VideoPlayer), { ssr: false });
const PdfViewer = dynamic(() => import('@/components/learn/pdf-viewer').then(m => m.PdfViewer), { ssr: false });
const PptxDownloader = dynamic(() => import('@/components/learn/pptx-downloader').then(m => m.PptxDownloader), { ssr: false });

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '');

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface TrailerAsset {
    id: string;
    title: string;
    type: 'VIDEO' | 'PDF' | 'PPTX' | 'QUIZ';
    bunnyVideoId?: string;
    lessonId: string;  // part id
    lectureId: string; // lecture id
}

interface TrailerLecture {
    id: string;
    title: string;
    order: number;
    assets: TrailerAsset[];
}

interface TrailerData {
    course: {
        id: string;
        title: string;
        price: string | number;
    };
    trailerLectures: TrailerLecture[];
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function TrailerWatchPage() {
    const params = useParams() as { courseId: string; locale?: string };
    const courseId = params.courseId;
    const locale = params.locale || 'ar';
    const isArabic = locale === 'ar';
    const searchParams = useSearchParams();
    const assetId = searchParams.get('assetId');
    const { status } = useAuth();
    const canWatch = status === 'authenticated';

    const [trailer, setTrailer] = useState<TrailerData | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // ── Fetch trailer data (public endpoint) ──
    useEffect(() => {
        if (!API_BASE_URL) return;
        fetch(`${API_BASE_URL}/trailer/${courseId}`, { cache: 'no-store' })
            .then(r => r.json())
            .then(json => {
                if (json.data) setTrailer(json.data);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [courseId]);

    // ── Flatten all trailer assets ──
    const allAssets = useMemo<TrailerAsset[]>(() => {
        if (!trailer) return [];
        return trailer.trailerLectures.flatMap(lec =>
            lec.assets.map(a => ({ ...a, lectureId: lec.id }))
        );
    }, [trailer]);

    const currentAsset = useMemo(() => {
        if (!allAssets.length) return null;
        if (assetId) return allAssets.find(a => a.id === assetId) ?? allAssets[0];
        return allAssets[0];
    }, [allAssets, assetId]);

    // ─────────────────────────────────────────
    // Loading state
    // ─────────────────────────────────────────
    if (loading) {
        return (
            <PlayerWrapper>
                <div className="flex h-screen items-center justify-center bg-slate-900">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                </div>
            </PlayerWrapper>
        );
    }

    if (!trailer) {
        return (
            <PlayerWrapper>
                <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-900 text-white">
                    <p className="text-slate-400">{isArabic ? 'لا يوجد عرض تعريفي لهذه الدورة' : 'No trailer available'}</p>
                    <Link href="/trailer" className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-bold text-white">
                        {isArabic ? 'العودة' : 'Back'}
                    </Link>
                </div>
            </PlayerWrapper>
        );
    }

    // ─────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────
    return (
        <PlayerWrapper>
            <div className="flex h-screen flex-col bg-slate-900 text-white overflow-hidden">

                {/* ── Top Header ── */}
                <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6 shrink-0 bg-slate-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/trailer/${courseId}`}
                            className="rounded-xl p-2 hover:bg-slate-800 transition-colors"
                        >
                            <ChevronLeft className="h-6 w-6 rtl:rotate-180" />
                        </Link>
                        <div className="hidden sm:block">
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                                {isArabic ? 'عرض تعريفي مجاني' : 'Free Preview'}
                            </p>
                            <h1 className="text-sm font-bold truncate max-w-[300px]">
                                {trailer.course.title}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Enroll CTA */}
                        <Link
                            href={`/enroll/${courseId}`}
                            className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            {isArabic ? 'اشترك الآن' : 'Enroll Now'}
                        </Link>

                        {/* Mobile sidebar toggle */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden rounded-xl bg-slate-800 p-2"
                        >
                            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] overflow-hidden">

                    {/* ── Main Player ── */}
                    <div className="flex flex-col overflow-y-auto bg-black relative min-w-0">
                        {currentAsset ? (
                            <div className="min-h-full flex flex-col">
                                <div className="flex-1 flex items-center justify-center p-4">

                                    {/* Not logged in → lock overlay */}
                                    {!canWatch ? (
                                        <div className="text-center p-12 bg-slate-900 rounded-3xl border border-slate-800 max-w-md w-full">
                                            <Lock className="h-16 w-16 text-slate-700 mx-auto mb-6" />
                                            <h2 className="text-2xl font-bold mb-3">
                                                {isArabic ? 'تسجيل الدخول مطلوب' : 'Sign in Required'}
                                            </h2>
                                            <p className="text-slate-400 mb-8">
                                                {isArabic ? 'سجّل دخولك لمشاهدة محتوى العرض التعريفي' : 'Sign in to watch the preview content'}
                                            </p>
                                            <Link
                                                href={`/login?redirect=/trailer/${courseId}/watch?assetId=${currentAsset?.id}` as any}
                                                className="inline-block rounded-2xl bg-indigo-600 px-8 py-4 font-bold text-white hover:bg-indigo-700"
                                            >
                                                {isArabic ? 'تسجيل الدخول' : 'Sign In'}
                                            </Link>
                                        </div>
                                    ) : (
                                        /* ── Actual player ── */
                                        <div className={cn("w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl bg-slate-900 h-full max-h-[80vh]", currentAsset.type === 'VIDEO' && "aspect-video")}>
                                            {currentAsset.type === 'VIDEO' && (
                                                <VideoPlayer
                                                    assetId={currentAsset.id}
                                                    courseId={courseId}
                                                    lessonId={currentAsset.lessonId}
                                                    initialTime={0}
                                                />
                                            )}
                                            {currentAsset.type === 'PDF' && (
                                                <PdfViewer
                                                    key={currentAsset.id}
                                                    lessonId={currentAsset.lessonId}
                                                    assetId={currentAsset.id}
                                                />
                                            )}
                                            {currentAsset.type === 'PPTX' && (
                                                <PptxDownloader lessonId={currentAsset.lessonId} />
                                            )}
                                            {currentAsset.type === 'QUIZ' && (
                                                <div className="flex h-full items-center justify-center text-slate-400">
                                                    {isArabic ? 'الاختبارات غير متاحة في العرض التعريفي' : 'Quizzes not available in preview'}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Asset title bar */}
                                <div className="bg-slate-900 border-t border-slate-800 px-8 py-6 mt-auto shrink-0">
                                    <div className="max-w-4xl mx-auto">
                                        <h2 className="text-xl font-bold">{currentAsset.title}</h2>
                                        <p className="mt-1 text-sm text-indigo-400">
                                            {isArabic ? 'محتوى العرض التعريفي' : 'Preview Content'}
                                        </p>
                                    </div>
                                </div>

                                {/* Mobile enroll CTA */}
                                <div className="sm:hidden bg-slate-900 border-t border-slate-800 px-6 py-4 shrink-0">
                                    <Link
                                        href={`/enroll/${courseId}`}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-bold text-white"
                                    >
                                        <ShoppingCart className="h-4 w-4" />
                                        {isArabic ? 'اشترك للوصول الكامل' : 'Enroll for Full Access'}
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-full flex-1 items-center justify-center min-h-[500px]">
                                <PlayCircle className="h-20 w-20 text-slate-800 animate-pulse" />
                            </div>
                        )}
                    </div>

                    {/* ── Sidebar — TRAILER ONLY ── */}
                    <div className={cn(
                        "border-l border-slate-800 bg-slate-900 overflow-y-auto transition-all fixed lg:relative inset-y-0 right-0 z-50 lg:z-0 lg:translate-x-0 rtl:right-auto rtl:left-0 rtl:border-l-0 rtl:border-r w-80 lg:w-auto",
                        sidebarOpen ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
                    )}>
                        {/* Sidebar header */}
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
                            <div>
                                <h3 className="font-bold text-sm">
                                    {isArabic ? 'محتوى العرض' : 'Preview Content'}
                                </h3>
                                <p className="text-xs text-indigo-400 mt-0.5">
                                    {allAssets.length} {isArabic ? 'عنصر' : 'items'}
                                </p>
                            </div>
                            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Trailer lectures */}
                        <div className="divide-y divide-slate-800">
                            {trailer.trailerLectures.map((lecture, lIdx) => (
                                <div key={lecture.id}>
                                    {/* Lecture header */}
                                    <div className="bg-slate-800/30 px-6 py-4">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                                            {isArabic ? 'محاضرة' : 'Lecture'} {lIdx + 1}
                                        </span>
                                        <h4 className="text-sm font-black text-slate-200">{lecture.title}</h4>
                                    </div>

                                    {/* Assets */}
                                    <div className="divide-y divide-slate-800/30">
                                        {lecture.assets.map(asset => {
                                            const isActive = currentAsset?.id === asset.id;
                                            const isLocked = !canWatch;

                                            return (
                                                <Link
                                                    key={asset.id}
                                                    href={`/trailer/${courseId}/watch?assetId=${asset.id}` as any}
                                                    onClick={() => {
                                                        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                                                            setSidebarOpen(false);
                                                        }
                                                    }}
                                                    className={cn(
                                                        "flex items-center gap-3 px-6 py-3 transition-colors hover:bg-slate-800",
                                                        isActive && "bg-indigo-600 font-bold text-white",
                                                        !isActive && "text-slate-400"
                                                    )}
                                                >
                                                    {isLocked ? (
                                                        <Lock className="h-4 w-4 shrink-0 opacity-50" />
                                                    ) : (
                                                        asset.type === 'VIDEO' ? <PlayCircle className="h-4 w-4 shrink-0" /> :
                                                        asset.type === 'PDF' ? <FileText className="h-4 w-4 shrink-0" /> :
                                                        asset.type === 'PPTX' ? <Presentation className="h-4 w-4 shrink-0 text-orange-400" /> :
                                                        <PlayCircle className="h-4 w-4 shrink-0" />
                                                    )}
                                                    <span className="text-sm line-clamp-1">{asset.title}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Sidebar enroll CTA */}
                        <div className="p-4 border-t border-slate-800 sticky bottom-0 bg-slate-900">
                            <Link
                                href={`/enroll/${courseId}`}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
                            >
                                <ShoppingCart className="h-4 w-4" />
                                {isArabic ? 'اشترك للوصول الكامل' : 'Enroll for Full Access'}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </PlayerWrapper>
    );
}
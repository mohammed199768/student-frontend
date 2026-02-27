'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Section, Progress } from '@/lib/api/types';
import { Link } from '@/i18n/routing';
import {
    ChevronLeft,
    PlayCircle,
    FileText,
    HelpCircle,
    CheckCircle2,
    Menu,
    X,
    Lock,
    Presentation
} from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { VideoPlayer } from '@/components/learn/video-player';
// import { PdfViewer } from '@/components/learn/pdf-viewer'; // REMOVED: CSR Only
import dynamic from 'next/dynamic';
const PdfViewer = dynamic(() => import('@/components/learn/pdf-viewer').then(mod => mod.PdfViewer), { ssr: false });
import { QuizPlayer } from '@/components/learn/quiz-player';
import { PptxDownloader } from '@/components/learn/pptx-downloader';
import { PlayerWrapper } from '@/components/learn/player-wrapper';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/contexts/auth-context';

export default function LearnPage() {
    const { courseId } = useParams() as { courseId: string };
    const searchParams = useSearchParams();
    const assetId = searchParams.get('assetId');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const t = useTranslations('student.learn');
    const { status } = useAuth();

    const { data: curriculum, isLoading } = useQuery({
        queryKey: ['curriculum', courseId],
        enabled: status === 'authenticated',
        queryFn: async () => {
            const { data } = await apiClient.get(`/courses/${courseId}/content`);
            return (data.data.content || []) as Section[];
        },
    });

    const { data: progress } = useQuery({
        queryKey: ['progress', courseId],
        enabled: status === 'authenticated',
        queryFn: async () => {
            const { data } = await apiClient.get(`/progress/course/${courseId}`);
            return data.data as Progress;
        },
    });

    // Flat list of all assets for easier navigation
    const allAssets = useMemo(() => {
        if (!curriculum) return [];
        return curriculum.flatMap(s =>
            s.lessons.flatMap(l =>
                l.assets.map(a => ({ ...a, lessonId: l.id, isAdminLocked: l.isLockedForStudent }))
            )
        );
    }, [curriculum]);

    const currentAsset = useMemo(() => {
        if (!allAssets.length) return null;
        if (assetId) return allAssets.find(a => a.id === assetId);
        // Find first unfinished asset or just the first one
        return allAssets[0];
    }, [allAssets, assetId]);

    if (status === 'initializing') return <div className="p-20 text-center">{t('loading')}</div>;
    if (isLoading) return <div className="p-20 text-center">{t('loading')}</div>;

    return (
        <PlayerWrapper>
            <div className="flex h-screen flex-col bg-slate-900 text-white overflow-hidden">
                {/* Top Header */}
                <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6 shrink-0 bg-slate-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="rounded-xl p-2 hover:bg-slate-800 transition-colors">
                            <ChevronLeft className="h-6 w-6 rtl:rotate-180" />
                        </Link>
                        <div className="hidden sm:block">
                            <h1 className="text-sm font-bold truncate max-w-[300px]">{t('course_title')}</h1>
                            <p className="text-xs text-slate-400">{t('track_progress')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-400">{progress?.percentage || 0}% {t('completed')}</span>
                            <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 transition-all duration-500"
                                    style={{ width: `${progress?.percentage || 0}%` }}
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden rounded-xl bg-slate-800 p-2"
                        >
                            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Main Player Area */}
                    <div className="flex-1 overflow-y-auto bg-black relative">
                        {currentAsset ? (
                            <div className="h-full flex flex-col">
                                <div className="flex-1 flex items-center justify-center p-4">
                                    {currentAsset.isLocked ? (
                                        <div className="text-center p-12 bg-slate-900 rounded-3xl border border-slate-800 max-w-md">
                                            <Lock className="h-16 w-16 text-slate-700 mx-auto mb-6" />
                                            {(currentAsset as any).isAdminLocked ? (
                                                <>
                                                    <h2 className="text-2xl font-bold mb-4">{t('locked_admin_title')}</h2>
                                                    <p className="text-slate-400 mb-8">{t('locked_admin_desc')}</p>
                                                    <a
                                                        href="#"
                                                        className="inline-block rounded-2xl bg-green-600 px-8 py-4 font-bold text-white hover:bg-green-700"
                                                    >
                                                        {t('contact_support')}
                                                    </a>
                                                </>
                                            ) : (
                                                <>
                                                    <h2 className="text-2xl font-bold mb-4">{t('locked_title')}</h2>
                                                    <p className="text-slate-400 mb-8">{t('locked_desc')}</p>
                                                    <Link
                                                        href={`/courses/${courseId}`}
                                                        className="inline-block rounded-2xl bg-indigo-600 px-8 py-4 font-bold text-white hover:bg-indigo-700"
                                                    >
                                                        {t('subscribe_now')}
                                                    </Link>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl bg-slate-900">
                                            {currentAsset.type === 'VIDEO' && (
                                                <VideoPlayer
                                                    assetId={currentAsset.id}
                                                    courseId={courseId}
                                                    lessonId={currentAsset.lessonId || ''}
                                                    // Find the lesson in curriculum to get latest progress
                                                    initialTime={curriculum?.flatMap(s => s.lessons).find(l => l.id === currentAsset.lessonId)?.lastPositionSeconds || 0}
                                                />
                                            )}
                                            {currentAsset.type === 'PDF' && (
                                                <PdfViewer
                                                    key={currentAsset.id} // Phase 10-FINAL-UI: Force Remount
                                                    lessonId={currentAsset.lessonId || ''}
                                                    assetId={currentAsset.id}
                                                />
                                            )}
                                            {currentAsset.type === 'PPTX' && <PptxDownloader lessonId={currentAsset.lessonId || ''} />}
                                            {currentAsset.type === 'QUIZ' && <QuizPlayer assetId={currentAsset.id} />}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-slate-900 border-t border-slate-800 p-8 min-h-[400px]">
                                    <div className="max-w-4xl mx-auto">
                                        <div>
                                            <h2 className="text-2xl font-bold mb-4">{currentAsset.title}</h2>
                                            <p className="text-slate-400 leading-relaxed">
                                                {/* TODO: Add description to asset schema */}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <PlayCircle className="h-20 w-20 text-slate-800 animate-pulse" />
                            </div>
                        )}
                    </div>

                    {/* Sidebar Curriculum */}
                    <div className={cn(
                        "w-80 border-l border-slate-800 bg-slate-900 overflow-y-auto transition-all fixed lg:relative inset-y-0 right-0 z-50 lg:z-0 lg:translate-x-0 rtl:right-auto rtl:left-0 rtl:border-l-0 rtl:border-r",
                        sidebarOpen ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
                    )}>
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold">{t('course_content')}</h3>
                            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="divide-y divide-slate-800">
                            {curriculum?.map((section, sIdx) => (
                                <div key={section.id}>
                                    <div className="bg-slate-800/30 px-6 py-4">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{t('section')} {sIdx + 1}</span>
                                        <h4 className="text-sm font-black text-slate-200">{section.title}</h4>
                                    </div>
                                    <div className="">
                                        {section.lessons.map(lesson => (
                                            <div key={lesson.id} className="border-b border-slate-800/50">
                                                <div className="px-6 py-3 bg-slate-900/50 text-xs font-bold text-slate-500">
                                                    {lesson.title}
                                                </div>
                                                <div className="divide-y divide-slate-800/30">
                                                    {lesson.assets.map(asset => {
                                                        const isActive = currentAsset?.id === asset.id;
                                                        const isCompleted = progress?.completedLessonIds?.includes(lesson.id);

                                                        return (
                                                            <Link
                                                                key={asset.id}
                                                                href={`/learn/${courseId}?assetId=${asset.id}`}
                                                                onClick={() => setSidebarOpen(false)}
                                                                className={cn(
                                                                    "flex items-center gap-3 px-8 py-3 transition-colors hover:bg-slate-800",
                                                                    isActive && "bg-indigo-600 font-bold text-white",
                                                                    !isActive && "text-slate-400"
                                                                )}
                                                            >
                                                                {isCompleted ? (
                                                                    <CheckCircle2 className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-green-500")} />
                                                                ) : (
                                                                    asset.type === 'VIDEO' ? <PlayCircle className="h-4 w-4 shrink-0" /> :
                                                                        asset.type === 'PDF' ? <FileText className="h-4 w-4 shrink-0" /> :
                                                                            asset.type === 'PPTX' ? <Presentation className="h-4 w-4 shrink-0 text-orange-400" /> :
                                                                                <HelpCircle className="h-4 w-4 shrink-0" />
                                                                )}
                                                                <span className="text-sm line-clamp-1">{asset.title}</span>
                                                                {asset.isLocked && <Lock className="ml-auto h-3 w-3 opacity-50" />}
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </PlayerWrapper>
    );
}

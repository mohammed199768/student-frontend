'use client';

import { Download, Presentation } from 'lucide-react';

interface PptxDownloaderProps {
    lessonId: string;
}

export function PptxDownloader({ lessonId }: PptxDownloaderProps) {
    const fileUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/lessons/${lessonId}/pdf`;

    return (
        <div className="flex flex-col h-full bg-slate-800 text-white rounded-3xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900/50">
                <div className="flex items-center gap-3">
                    <Presentation className="h-5 w-5 text-orange-400" />
                    <h3 className="font-bold text-sm">عرض PPTX (تحميل/فتح)</h3>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-700 space-y-8 text-center">
                <div className="p-8 bg-slate-800/50 rounded-full">
                    <Presentation className="h-24 w-24 text-orange-500" />
                </div>
                
                <div className="max-w-md">
                    <h2 className="text-2xl font-bold mb-4">ملف عرض تقديمي (PPTX)</h2>
                    <p className="text-slate-400 mb-8">
                        هذا الملف لا يدعم العرض المباشر داخل المتصفح. يرجى تحميل الملف لفتحه باستخدام PowerPoint أو أي تطبيق متوافق.
                    </p>
                    
                    <a
                        href={fileUrl}
                        download
                        className="inline-flex items-center gap-3 bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg active:scale-95"
                    >
                        <Download className="h-6 w-6" /> تحميل الملف الآن
                    </a>
                </div>
            </div>

            <div className="p-6 bg-slate-900/30 text-center">
                <p className="text-xs text-slate-500">
                    ملاحظة: بمجرد التحميل، يمكنك فتح الملف على جهازك الشخصي.
                </p>
            </div>
        </div>
    );
}

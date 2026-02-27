import { Course } from '@/lib/api/types';
import { Link } from '@/i18n/routing';
import { formatPrice } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Clock, PlayCircle } from 'lucide-react';

interface CourseCardProps {
    course: Course;
    variant?: 'light' | 'dark';
}

export function CourseCard({ course, variant = 'light' }: CourseCardProps) {
    const ct = useTranslations('common');
    
    // Formatting helpers
    const isDark = variant === 'dark';
    
    // Modern "Framed" Premium Card Design
    const cardBg = isDark 
        ? "bg-slate-900 border-slate-800 shadow-xl" 
        : "bg-slate-100 border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]";

    const pillBg = isDark
        ? "bg-slate-800 text-slate-300 border-slate-700"
        : "bg-white text-slate-700 border-slate-200 shadow-sm";

    const priceColor = isDark ? "text-white" : "text-slate-900";
    
    const playBtn = isDark
        ? "bg-indigo-500/20 text-indigo-400 border-transparent hover:bg-indigo-500/30"
        : "bg-white text-indigo-600 border-slate-200 shadow-sm hover:bg-indigo-50";

    return (
        <div className={`group relative flex flex-col overflow-hidden rounded-[24px] border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${cardBg}`}>
            {/* Framed Image Section */}
            <div className="p-2 pb-0">
                <Link href={`/courses/${course.id}`} className="relative block aspect-16/10 overflow-hidden rounded-[16px] w-full shadow-sm bg-slate-200 dark:bg-slate-800">
                    {/* Placeholder Box - No Images Policy (12_CONTRACTS.md) */}
                    <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-indigo-500 via-indigo-600 to-indigo-800 transition-transform duration-700 group-hover:scale-105 p-6 z-0 overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-t from-slate-900/40 to-transparent z-0"></div>
                        <h3 className="text-white font-black text-xl md:text-2xl text-center leading-tight drop-shadow-xl z-20 relative px-2">
                            {course.title}
                        </h3>
                        {/* Decorative glow elements */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl z-10 transition-transform duration-700 group-hover:scale-150"></div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl z-10 transition-transform duration-700 group-hover:scale-150"></div>
                    </div>
                    {course.isFree && (
                        <div className="absolute top-3 right-3 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg z-30">
                            {ct('free')}
                        </div>
                    )}
                </Link>
            </div>

            {/* Content Section */}
            <div className="flex flex-1 flex-col p-5 pt-4">
                <div className="mb-4 flex items-center justify-between gap-2">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border truncate max-w-[65%] ${pillBg}`}>
                        {course.university?.name || 'University'}
                    </span>
                    
                    {course.duration && (
                        <div className="flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
                            <Clock className="mr-1.5 h-3.5 w-3.5" />
                            <span className="dir-ltr">{course.duration}</span>
                        </div>
                    )}
                </div>

                <div className="mt-auto">
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
                        <div className="flex flex-col">
                            {course.salePrice ? (
                                <>
                                    <span className="text-[11px] text-slate-400 line-through font-medium mb-0.5">{formatPrice(course.price)}</span>
                                    <span className={`text-xl font-black leading-none ${priceColor}`}>{formatPrice(course.salePrice)}</span>
                                </>
                            ) : (
                                <span className={`text-xl font-black ${priceColor}`}>
                                    {course.isFree ? ct('free') : formatPrice(course.price)}
                                </span>
                            )}
                        </div>
                        <Link
                            href={`/courses/${course.id}`}
                            aria-label={`${course.title} - عرض الكورس`}
                            className={`flex items-center justify-center rounded-xl border p-2.5 transition-colors ${playBtn}`}
                        >
                            <PlayCircle className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

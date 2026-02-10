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
    const bgClass = isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white border-slate-200 hover:-translate-y-1";

    const textSub = isDark ? "text-slate-400" : "text-slate-500";
    const priceColor = isDark ? "text-white" : "text-slate-900";
    const pillClass = isDark ? "bg-white/10 text-indigo-300" : "bg-indigo-50 text-indigo-600";
    const borderClass = isDark ? "border-white/10" : "border-slate-100";
    const btnClass = isDark ? "bg-indigo-600 hover:bg-indigo-500" : "bg-slate-900 hover:bg-indigo-600";

    return (
        <div className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all hover:shadow-2xl ${bgClass}`}>
            <Link href={`/courses/${course.id}`} className="aspect-video overflow-hidden relative">
                {/* Placeholder Box - No Images Policy (12_CONTRACTS.md) */}
                <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-indigo-600 to-indigo-800 transition-all duration-500 group-hover:from-indigo-500 group-hover:to-indigo-700 p-6">
                    <h3 className="text-white font-extrabold text-2xl md:text-3xl text-center leading-tight drop-shadow-md">
                        {course.title}
                    </h3>
                </div>
                {course.isFree && (
                    <div className="absolute top-3 right-3 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white shadow-lg z-10">
                        {ct('free')}
                    </div>
                )}
            </Link>

            <div className="flex flex-1 flex-col p-5">
                <div className="mb-4 flex items-center justify-between">
                    <span className={`text-xs font-medium px-2 py-1 rounded-md ${pillClass}`}>
                        {course.level || ct('all_levels')}
                    </span>
                </div>

                <div className="mt-auto">
                    <div className={`mb-4 flex items-center gap-4 text-xs ${textSub}`}>

                        {course.duration && (
                            <div className="flex items-center">
                                <Clock className="mr-1.5 h-3.5 w-3.5" />
                                <span className="dir-ltr">{course.duration}</span>
                            </div>
                        )}
                    </div>

                    <div className={`flex items-center justify-between pt-4 border-t ${borderClass}`}>
                        <div className="flex flex-col">
                            {course.salePrice ? (
                                <>
                                    <span className="text-xs text-slate-500 line-through">{formatPrice(course.price)}</span>
                                    <span className={`text-lg font-bold ${priceColor}`}>{formatPrice(course.salePrice)}</span>
                                </>
                            ) : (
                                <span className={`text-lg font-bold ${priceColor}`}>
                                    {course.isFree ? ct('free') : formatPrice(course.price)}
                                </span>
                            )}
                        </div>
                        <Link
                            href={`/courses/${course.id}`}
                            className={`flex items-center justify-center rounded-xl p-2.5 text-white transition-all shadow-lg shadow-indigo-500/20 ${btnClass}`}
                        >
                            <PlayCircle className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

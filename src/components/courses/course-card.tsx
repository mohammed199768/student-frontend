import { Course } from '@/lib/api/types';
import { Link } from '@/i18n/routing';
import { formatPrice } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Clock, PlayCircle } from 'lucide-react';

interface CourseCardProps {
    course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
    const ct = useTranslations('common');

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-[24px] border bg-slate-100 border-slate-200/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900 dark:border-slate-800 dark:shadow-xl">
            <div className="p-2 pb-0">
                <Link href={`/courses/${course.id}`} className="relative block aspect-16/10 overflow-hidden rounded-[16px] w-full shadow-sm bg-slate-200 dark:bg-slate-800">
                    <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-indigo-500 via-indigo-600 to-indigo-800 transition-transform duration-700 group-hover:scale-105 p-6 z-0 overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-t from-slate-900/40 to-transparent z-0"></div>
                        <h3 className="text-white font-black text-xl md:text-2xl text-center leading-tight drop-shadow-xl z-20 relative px-2">
                            {course.title}
                        </h3>
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

            <div className="flex flex-1 flex-col p-5 pt-4">
                <div className="mb-4 flex items-center justify-between gap-2">
                    <span className="text-sm md:text-base font-black px-3.5 py-2 rounded-lg border truncate max-w-[72%] bg-slate-200 text-slate-800 border-slate-300 shadow-sm dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700">
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
                                    <span className="text-xl font-black leading-none text-slate-900 dark:text-white">{formatPrice(course.salePrice)}</span>
                                </>
                            ) : (
                                <span className="text-xl font-black text-slate-900 dark:text-white">
                                    {course.isFree ? ct('free') : formatPrice(course.price)}
                                </span>
                            )}
                        </div>
                        <Link
                            href={`/courses/${course.id}`}
                            aria-label={`${course.title} - عرض الكورس`}
                            className="flex items-center justify-center rounded-xl border p-2.5 transition-colors bg-white text-indigo-600 border-slate-200 shadow-sm hover:bg-indigo-50 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-transparent dark:hover:bg-indigo-500/30"
                        >
                            <PlayCircle className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

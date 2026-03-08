import { Navbar } from '@/components/common/navbar';
import { Link } from '@/i18n/routing';
import { BookOpen, Play, Users } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface TrailerCourse {
    id: string;
    title: string;
    thumbnail?: string | null;
    description?: string | null;
    price: string | number;
    university?: { id: string; name: string; logo?: string | null } | null;
    _count?: { enrollments?: number; lectures?: number };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '');

async function getTrailerCourses(): Promise<TrailerCourse[]> {
    if (!API_BASE_URL) return [];

    try {
        const res = await fetch(`${API_BASE_URL}/trailer`, {
            next: { revalidate: 60 },
        });

        if (!res.ok) return [];

        const json = await res.json();
        return (json.data || []) as TrailerCourse[];
    } catch {
        return [];
    }
}

export default async function TrailerListPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const isArabic = locale === 'ar';
    const courses = await getTrailerCourses();

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            <Navbar />

            <main className="container mx-auto px-4 py-12 pb-28 md:pb-12">
                <div className="mb-10 text-center">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                        <Play className="h-4 w-4" />
                        {isArabic ? 'عروض مجانية' : 'Free Previews'}
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {isArabic ? 'شاهد قبل الاشتراك' : 'Watch Before You Buy'}
                    </h1>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                        {isArabic
                            ? 'استعرض محتوى مختار من كل دورة بشكل مجاني.'
                            : 'Browse selected content from each course for free.'}
                    </p>
                </div>

                {courses.length === 0 ? (
                    <div className="py-20 text-center">
                        <BookOpen className="mx-auto mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" />
                        <p className="text-slate-500 dark:text-slate-400">
                            {isArabic ? 'لا توجد عروض متاحة حالياً.' : 'No trailers available yet.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <Link
                                key={course.id}
                                href={`/trailer/${course.id}`}
                                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-slate-900"
                            >
                                <div className="flex h-40 items-center justify-center bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 text-center text-white">
                                    <h2 className="line-clamp-2 text-lg font-bold">{course.title}</h2>
                                </div>

                                <div className="space-y-3 p-4">
                                    <p className="text-xs font-medium uppercase tracking-wide text-indigo-500 dark:text-indigo-400">
                                        {course.university?.name || 'University'}
                                    </p>
                                    <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                                        {course.description || (isArabic
                                            ? 'يتوفر عرض تعريفي مجاني لمحتوى هذه الدورة.'
                                            : 'Course trailer content is available for preview.')}
                                    </p>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-1 text-xs text-slate-400">
                                            <Users className="h-3.5 w-3.5" />
                                            <span>{course._count?.enrollments ?? 0}</span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                                            {formatPrice(Number(course.price))}
                                        </span>
                                    </div>

                                    <div className="pt-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                        {isArabic ? 'مشاهدة العرض' : 'Watch Preview'}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

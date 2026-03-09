import { Navbar } from '@/components/common/navbar';
import { Play } from 'lucide-react';
import { TrailerListClient, type TrailerCourse } from './components/TrailerListClient';

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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar />

            <main className="container mx-auto px-4 py-12 pb-28 md:pb-12">
                <div className="mb-10 text-center">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                        <Play className="h-4 w-4 fill-current" />
                        {isArabic ? 'عروض مجانية' : 'Free Previews'}
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
                        {isArabic ? 'شاهد قبل الاشتراك' : 'Watch Before You Buy'}
                    </h1>
                    <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                        {isArabic
                            ? 'استعرض محتوى مختار من كل دورة بشكل مجاني لتتأكد من جودة الشرح والمادة العلمية قبل الاشتراك.'
                            : 'Browse selected content from each course for free to ensure the quality of teaching before you enroll.'}
                    </p>
                </div>

                <TrailerListClient courses={courses} isArabic={isArabic} />
            </main>
        </div>
    );
}

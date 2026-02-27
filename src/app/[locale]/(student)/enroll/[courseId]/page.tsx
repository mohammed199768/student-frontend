'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Course } from '@/lib/api/types';
import { useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Loader2, ShieldCheck, CheckCircle, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { Navbar } from '@/components/common/navbar';
import { Footer } from '@/components/common/footer';
import { formatPrice } from '@/lib/utils';
import { buildWhatsAppUrl } from '@/lib/constants/support';

import { useTranslations } from 'next-intl';

export default function EnrollmentPage() {
    const { courseId } = useParams() as { courseId: string; locale: string };
    const [requestSuccess, setRequestSuccess] = useState(false);
    const [enrollmentData, setEnrollmentData] = useState<{ id: string } | null>(null);
    const router = useRouter();
    const t = useTranslations('student.enroll');
    const ct = useTranslations('common');

    const { data: course, isLoading: loadingCourse } = useQuery({
        queryKey: ['course-enroll', courseId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/catalog/courses/${courseId}`);
            return data.data as Course;
        },
    });

    const enrollMutation = useMutation({
        mutationFn: async () => {
            const { data } = await apiClient.post(`/enrollments/${courseId}/request`);
            return data.data;
        },
        onSuccess: (data) => {
            if (data.status === 'ACTIVE') {
                toast.success(t('success_title'));
                router.push(`/learn/${courseId}`);
            } else {
                setEnrollmentData(data);
                setRequestSuccess(true);
                toast.success(t('request_success_title'));
            }
        },
        onError: (error: unknown) => {
            const err = error as any;

            if (err.response?.status === 403) {
                toast((t2) => (
                    <div className="flex flex-col gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white">{t('verify_required')}</span>
                        <button
                            onClick={() => {
                                toast.dismiss(t2.id);
                                router.push('/verify-email');
                            }}
                            className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700"
                        >
                            {t('verify_now')}
                        </button>
                    </div>
                ), { duration: 6000, icon: <ShieldCheck className="h-5 w-5 text-indigo-600" /> });
                return;
            }

            if (err.response?.data?.message?.includes('Already enrolled')) {
                toast.error(t('already_enrolled'));
                return;
            }
            toast.error(err.response?.data?.message || t('request_failed'));
        },
    });

    const handleWhatsAppRedirect = () => {
        if (!enrollmentData) return;
        const message = t('whatsapp_message', { title: course?.title || '', id: enrollmentData.id });
        const url = buildWhatsAppUrl(message);
        window.open(url, '_blank');
    };

    if (loadingCourse) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!course) return <div className="p-20 text-center text-slate-900 dark:text-white">{t('not_found')}</div>;

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
            <Navbar />

            <main className="flex-1 py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto">

                        {/* Course Card */}
                        <div className="mb-8 flex items-center gap-6 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
                            {/* Placeholder Box - No Images Policy */}
                            <div className="relative h-24 w-40 rounded-2xl overflow-hidden shrink-0 hidden sm:flex items-center justify-center bg-linear-to-br from-indigo-600 to-indigo-800">
                                <h4 className="text-white font-bold text-sm text-center px-2 line-clamp-2">
                                    {course.title}
                                </h4>
                            </div>
                            <div className="flex-1">
                                <h1 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">{course.title}</h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{course.instructorId}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-slate-900 dark:text-white">
                                    {course.isFree ? ct('free') : formatPrice(course.salePrice || course.price)}
                                </p>
                            </div>
                        </div>

                        {requestSuccess ? (
                            <div className="space-y-6 rounded-3xl border border-green-100 dark:border-green-900 bg-white dark:bg-slate-800 p-8 text-center shadow-lg">
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                                    <CheckCircle className="h-10 w-10 text-green-600" />
                                </div>

                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('request_success_title')}</h2>
                                <p className="mx-auto max-w-md leading-relaxed text-slate-600 dark:text-slate-300">
                                    {t('success_desc')}
                                </p>

                                <div className="inline-block rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 p-4 px-8">
                                    <p className="mb-1 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('enrollment_id')}</p>
                                    <p className="text-xl font-mono font-bold text-indigo-600 select-all">{enrollmentData?.id}</p>
                                </div>

                                <button
                                    onClick={handleWhatsAppRedirect}
                                    className="mx-auto flex w-full items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-8 py-4 font-bold text-white shadow-lg shadow-green-100 transition-all hover:bg-[#128C7E] sm:w-auto"
                                >
                                    <Smartphone className="h-5 w-5" />
                                    {t('contact_whatsapp')}
                                </button>

                                <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">{t('activation_note')}</p>
                            </div>
                        ) : (
                            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-lg">
                                <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">{t('confirm_title')}</h2>
                                <p className="mb-8 text-slate-600 dark:text-slate-300">
                                    {t('confirm_desc')}
                                </p>

                                <button
                                    onClick={() => enrollMutation.mutate()}
                                    disabled={enrollMutation.isPending}
                                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {enrollMutation.isPending ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            {t('processing')}
                                        </>
                                    ) : (
                                        t('send_request')
                                    )}
                                </button>

                                <div className="mt-6 flex items-start gap-3 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200">
                                    <ShieldCheck className="h-5 w-5 shrink-0" />
                                    <p>{t('secure_note')}</p>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

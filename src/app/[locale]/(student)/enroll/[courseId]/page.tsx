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

import { useTranslations } from 'next-intl';

export default function EnrollmentPage() {
    const { courseId } = useParams() as { courseId: string; locale: string };
    // const { user, isLoading: authLoading } = useAuth(); // Unused
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
            // New endpoint for manual request
            const { data } = await apiClient.post(`/enrollments/${courseId}/request`);
            return data.data;
        },
        onSuccess: (data) => {
            if (data.status === 'ACTIVE') {
                 // Free course auto-activation
                toast.success(t('success_title'));
                router.push(`/learn/${courseId}`);
            } else {
                // Pending manual payment
                setEnrollmentData(data);
                setRequestSuccess(true);
                toast.success(t('request_success_title'));
            }
        },
        onError: (error: unknown) => {
             // Handle existing pending enrollment
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             const err = error as any;
             
             if (err.response?.status === 403) {
                 toast((t2) => (
                    <div className="flex flex-col gap-2">
                        <span className="font-semibold text-slate-900">{t('verify_required')}</span>
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
                 // Optionally fetch existing enrollment to show success screen? 
                 // For MVP just redirect or show error clearly.
                 return;
             }
            toast.error(err.response?.data?.message || t('request_failed'));
        },
    });

    const handleWhatsAppRedirect = () => {
        if (!enrollmentData) return;
        const phone = '963900000000'; // Replace with env var if available
        const message = t('whatsapp_message', { title: course?.title || '', id: enrollmentData.id });
        
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    if (loadingCourse) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!course) return <div className="p-20 text-center">{t('not_found')}</div>;

    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <Navbar />

            <main className="flex-1 py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto">
                        
                        {/* Course Card */}
                        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm mb-8 flex items-center gap-6">
                            {/* Placeholder Box - No Images Policy */}
                            <div className="relative h-24 w-40 rounded-2xl overflow-hidden shrink-0 hidden sm:flex items-center justify-center bg-linear-to-br from-indigo-600 to-indigo-800">
                                <h4 className="text-white font-bold text-sm text-center px-2 line-clamp-2">
                                    {course.title}
                                </h4>
                            </div>
                            <div className="flex-1">
                                <h1 className="text-xl font-bold text-slate-900 mb-2">{course.title}</h1>
                                <p className="text-sm text-slate-500">{course.instructorId}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-slate-900">
                                    {course.isFree ? ct('free') : formatPrice(course.salePrice || course.price)}
                                </p>
                            </div>
                        </div>

                        {requestSuccess ? (
                            <div className="rounded-3xl bg-white p-8 border border-green-100 shadow-lg text-center space-y-6">
                                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle className="h-10 w-10 text-green-600" />
                                </div>
                                
                                <h2 className="text-2xl font-bold text-slate-900">{t('request_success_title')}</h2>
                                <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
                                    {t('success_desc')}
                                </p>

                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 inline-block px-8">
                                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">{t('enrollment_id')}</p>
                                    <p className="text-xl font-mono font-bold text-indigo-600 select-all">{enrollmentData?.id}</p>
                                </div>

                                <button 
                                    onClick={handleWhatsAppRedirect}
                                    className="w-full sm:w-auto px-8 py-4 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all mx-auto shadow-lg shadow-green-100"
                                >
                                    <Smartphone className="h-5 w-5" />
                                    {t('contact_whatsapp')}
                                </button>
                                
                                <p className="text-xs text-slate-400 mt-4">{t('activation_note')}</p>
                            </div>
                        ) : (
                            <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-lg">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('confirm_title')}</h2>
                                <p className="text-slate-600 mb-8">
                                    {t('confirm_desc')}
                                </p>

                                <button
                                    onClick={() => enrollMutation.mutate()}
                                    disabled={enrollMutation.isPending}
                                    className="w-full rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

                                <div className="mt-6 flex items-start gap-3 bg-indigo-50 p-4 rounded-xl text-sm text-indigo-800">
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

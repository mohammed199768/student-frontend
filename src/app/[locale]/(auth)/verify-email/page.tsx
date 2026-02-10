'use client';

import { apiClient } from '@/lib/api/client';
import { Link, useRouter } from '@/i18n/routing';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/contexts/auth-context';

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
}

export default function VerifyEmailPage() {
    const t = useTranslations('auth');
    // const ct = useTranslations('common');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { user } = useAuth(); // Optionally use user email for UX if needed, but not strictly required for the API call as it uses the valid session.

    const verifySchema = z.object({
        code: z.string().length(6, t('validation_code_length')),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<z.infer<typeof verifySchema>>({
        resolver: zodResolver(verifySchema),
    });

    const onVerify = async (values: z.infer<typeof verifySchema>) => {
        setIsSubmitting(true);
        try {
            await apiClient.post('/auth/verify-email', values);
            toast.success(t('verify_success'));
            router.push('/dashboard');
        } catch (error: unknown) {
            const err = error as ApiError;
            const message = err.response?.data?.message || t('invalid_code');
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        try {
            await apiClient.post('/auth/resend-verification', { email: user?.email });
            toast.success(t('resend_success'));
        } catch (error: unknown) {
             const err = error as ApiError;
            const message = err.response?.data?.message || t('resend_error');
            toast.error(message);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-extrabold text-slate-900">
                        {t('verify_email')}
                    </h1>
                    <p className="mt-2 text-slate-600">
                        {t('verification_desc')}
                    </p>
                </div>

                <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200 border border-slate-100">
                    <form onSubmit={handleSubmit(onVerify)} className="space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700 text-center">{t('verify_code_label')}</label>
                            <input
                                {...register('code')}
                                type="text"
                                maxLength={6}
                                placeholder="000000"
                                className="w-full text-center text-3xl tracking-[1em] rounded-2xl border border-slate-200 bg-slate-50 py-4 font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dir-ltr"
                            />
                            {errors.code && <p className="mt-1 text-center text-xs text-red-500">{errors.code.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex w-full items-center justify-center rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : t('verify')}
                        </button>

                        <button
                            type="button"
                            onClick={handleResend}
                            className="w-full text-sm font-bold text-indigo-600 hover:underline"
                        >
                            {t('resend_code')}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-600">
                         <Link href="/" className="inline-flex items-center text-indigo-600 font-bold hover:underline">
                            <ArrowLeft className="mr-2 h-4 w-4 rtl:rotate-180" /> {t('back_home')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

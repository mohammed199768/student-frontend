'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import { apiClient } from '@/lib/api/client';
import { Link } from '@/i18n/routing';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    const t = useTranslations('auth.forgotPassword');
    const ct = useTranslations('common');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const forgotPasswordSchema = z.object({
        email: z.string().email(),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
        setIsSubmitting(true);
        try {
            await apiClient.post('/auth/forgot-password', values);
        } catch (error) {
            console.error('Forgot password error', error);
            // Anti-Enumeration: Do not show error to user if email not found
        } finally {
            setIsSubmitting(false);
            // Always show success state
            setIsSuccess(true);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 p-4">
                <div className="w-full max-w-md text-center">
                    <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200 border border-slate-100">
                        <div className="mb-6 flex justify-center">
                            <div className="rounded-full bg-green-100 p-3">
                                <Mail className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-slate-900">{t('success')}</h2>
                        <p className="mb-8 text-slate-600">{t('description')}</p>
                        <Link
                            href="/login"
                            className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 py-3 font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 hover:shadow-xl"
                        >
                            {t('backToLogin')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <Link href="/login" className="inline-flex items-center text-indigo-600 font-bold mb-4 hover:underline">
                        <ArrowLeft className="mr-2 h-4 w-4 rtl:rotate-180" /> {t('backToLogin')}
                    </Link>
                    <h1 className="text-3xl font-extrabold text-slate-900">{t('title')}</h1>
                    <p className="mt-2 text-slate-600">{t('subtitle')}</p>
                </div>

                <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200 border border-slate-100">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700">{t('email')}</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 rtl:right-3 rtl:left-auto" />
                                <input
                                    {...register('email')}
                                    type="email"
                                    placeholder="name@example.com"
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rtl:pr-10 rtl:pl-4"
                                />
                            </div>
                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex w-full items-center justify-center rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : t('submit')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

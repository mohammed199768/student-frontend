'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import { apiClient } from '@/lib/api/client';
import { Link } from '@/i18n/routing';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Mail, Lock, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
}

export default function LoginPage() {
    const t = useTranslations('auth');
    const ct = useTranslations('common');
    const { login } = useAuth();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get('redirect') || '/dashboard';
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const loginSchema = z.object({
        email: z.string().email(t('validation_email')),
        password: z.string().min(6, t('validation_password_min')),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (values: z.infer<typeof loginSchema>) => {
        setIsSubmitting(true);
        try {
            const { data } = await apiClient.post<any>('/auth/login', values);
            await login(data.data.accessToken, redirectPath);
            toast.success(t('login_success'));
        } catch (error: unknown) {
            const err = error as ApiError;
            toast.error(err.response?.data?.message || t('login_error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-flex items-center text-indigo-600 font-bold mb-4 hover:underline">
                        <ArrowLeft className="mr-2 h-4 w-4 rtl:rotate-180" /> {t('back_home')}
                    </Link>
                    <h1 className="text-3xl font-extrabold text-slate-900">{t('welcome_back')}</h1>
                    <p className="mt-2 text-slate-600">{t('login_subtitle')}</p>
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

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label className="text-sm font-bold text-slate-700">{t('password')}</label>
                                <Link href="/forgot-password" className="text-xs font-bold text-indigo-600 hover:underline">{t('forgot_password')}</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 rtl:right-3 rtl:left-auto" />
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rtl:pr-10 rtl:pl-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 rtl:left-3 rtl:right-auto"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex w-full items-center justify-center rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : ct('login')}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-600">
                        {t('no_account')}{' '}
                        <Link href="/register" className="font-bold text-indigo-600 hover:underline">
                            {t('create_account')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import { apiClient } from '@/lib/api/client';
import { Link } from '@/i18n/routing';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface ApiError {
    response?: {
        status?: number;
        data?: {
            message?: string;
        };
    };
}

export default function RegisterPage() {
    const t = useTranslations('auth');
    const ct = useTranslations('common');
    const { login } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const submitLockRef = useRef(false);
    const [showPassword, setShowPassword] = useState(false);

    const registerSchema = z.object({
        firstName: z.string().min(2, t('validation_name_min')),
        lastName: z.string().min(2, t('validation_name_min')),
        email: z.string().email(t('validation_email')),
        password: z.string().min(6, t('validation_password_min')),
        phoneNumber: z.string().optional(),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (values: z.infer<typeof registerSchema>) => {
        if (submitLockRef.current) return;
        submitLockRef.current = true;
        setIsSubmitting(true);
        try {
            await apiClient.post('/auth/register', values);
            const loginRes = await apiClient.post<any>('/auth/login', {
                email: values.email,
                password: values.password,
            });
            await login(loginRes.data.data.accessToken, '/verify-email');
            toast.success(t('register_success'));
        } catch (error: unknown) {
            const err = error as ApiError;
            const status = err.response?.status;
            let message = t('register_error');

            if (status === 409) {
                message = t('email_exists');
            } else if (status === 429) {
                message = t('too_many_attempts');
            }

            toast.error(message);
        } finally {
            setIsSubmitting(false);
            submitLockRef.current = false;
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-bold mb-4 hover:underline">
                        <ArrowLeft className="mr-2 h-4 w-4 rtl:rotate-180" /> {t('back_home')}
                    </Link>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                        {t('create_account')}
                    </h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">
                        {t('register_subtitle')}
                    </p>
                </div>

                <div className="rounded-3xl bg-white dark:bg-slate-800/80 p-8 shadow-xl shadow-slate-200/60 dark:shadow-slate-950/30 border border-slate-100 dark:border-slate-700/50">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">{t('first_name')}</label>
                                <input
                                    {...register('firstName')}
                                    type="text"
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 p-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                                />
                                {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">{t('last_name')}</label>
                                <input
                                    {...register('lastName')}
                                    type="text"
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 p-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                                />
                                {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">{t('phone_number')}</label>
                            <input
                                {...register('phoneNumber')}
                                type="tel"
                                placeholder="+123..."
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 p-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none dir-ltr"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">{t('email')}</label>
                            <input
                                {...register('email')}
                                type="email"
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 p-3 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none dir-ltr"
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">{t('password')}</label>
                            <div className="relative">
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 p-3 pr-10 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none dir-ltr rtl:pl-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rtl:left-3 rtl:right-auto"
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
                            className="flex w-full items-center justify-center rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : t('create_account')}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-300">
                        {t('have_account')}{' '}
                        <Link href="/login" className="font-bold text-indigo-600 hover:underline">
                            {ct('login')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}


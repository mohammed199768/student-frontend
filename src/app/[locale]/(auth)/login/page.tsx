'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import { apiClient } from '@/lib/api/client';
import { Link } from '@/i18n/routing';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { Mail, Lock, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface ApiError {
    response?: {
        status?: number;
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
    const submitLockRef = useRef(false);
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
        if (submitLockRef.current) return;
        submitLockRef.current = true;
        setIsSubmitting(true);
        try {
            const { data } = await apiClient.post<any>('/auth/login', values);
            await login(data.data.accessToken, redirectPath);
            toast.success(t('login_success'));
        } catch (error: unknown) {
            const err = error as ApiError;
            const status = err.response?.status;
            let message = t('login_error');

            if (status === 401) {
                message = t('invalid_credentials');
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
        <div className="relative flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 dark:bg-blue-500/20 blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-[420px] relative z-10">
                <div className="mb-8 text-center animate-fade-in-up">
                    <Link href="/" className="inline-flex items-center text-sm font-semibold text-slate-500 dark:text-slate-400 mb-6 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
                        <ArrowLeft className="mr-2 h-4 w-4 rtl:rotate-180" /> {t('back_home')}
                    </Link>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                        {t('welcome_back')}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        {t('login_subtitle')}
                    </p>
                </div>

                <div className="relative rounded-3xl bg-white dark:bg-slate-900 p-8 sm:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 animate-fade-in-up [animation-delay:100ms]">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                        <div className="group">
                            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {t('email')}
                            </label>
                            <div className="relative flex items-center">
                                <Mail className="absolute left-4 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors rtl:right-4 rtl:left-auto" />
                                <input
                                    {...register('email')}
                                    type="email"
                                    placeholder="name@example.com"
                                    className="w-full rounded-2xl border-2 border-transparent bg-slate-50 dark:bg-slate-950 py-3.5 pl-11 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all rtl:pr-11 rtl:pl-4 shadow-inner dark:shadow-black/20"
                                />
                            </div>
                            {errors.email && <p className="mt-2 text-xs font-medium text-red-500 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500"></span>{errors.email.message}</p>}
                        </div>

                        <div className="group">
                            <div className="mb-2 flex items-center justify-between">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    {t('password')}
                                </label>
                                <Link href="/forgot-password" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                                    {t('forgot_password')}
                                </Link>
                            </div>
                            <div className="relative flex items-center">
                                <Lock className="absolute left-4 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors rtl:right-4 rtl:left-auto" />
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full rounded-2xl border-2 border-transparent bg-slate-50 dark:bg-slate-950 py-3.5 pl-11 pr-12 text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all rtl:pr-11 rtl:pl-12 shadow-inner dark:shadow-black/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-all rtl:left-3 rtl:right-auto"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-2 text-xs font-medium text-red-500 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500"></span>{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-900 dark:bg-indigo-600 py-4 font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 shadow-xl shadow-slate-900/20 dark:shadow-indigo-900/30"
                        >
                            <div className="absolute inset-0 bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 transition-opacity group-hover:opacity-100 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 dark:opacity-0 dark:group-hover:opacity-20" />
                            <span className="relative flex items-center gap-2">
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : ct('login')}
                            </span>
                        </button>
                    </form>

                    <div className="relative mt-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                        {t('no_account')}{' '}
                        <Link
                            href={searchParams.get('redirect') ? `/register?redirect=${searchParams.get('redirect')}` as any : "/register"}
                            className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors underline decoration-2 underline-offset-4 decoration-indigo-500/30 hover:decoration-indigo-500"
                        >
                            {t('create_account')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}


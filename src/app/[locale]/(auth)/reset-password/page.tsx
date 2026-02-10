'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { apiClient } from '@/lib/api/client';
import { toast } from 'react-hot-toast';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
  const t = useTranslations('auth.resetPassword');
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error(t('errors.missingToken'));
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error(t('errors.passwordsDoNotMatch'));
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error(t('errors.passwordTooShort'));
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post('/auth/reset-password', {
        token,
        newPassword: formData.newPassword,
      });

      toast.success(t('success'));
      router.push(`/${locale}/login`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      // Anti-enumeration/Safe Error
      // We map specific backend errors to generic ones if needed, 
      // but usually for reset, "Invalid or expired" is fine.
      // The i18n key 'errors.invalidLink' or generic can be used.
      const msg = err.response?.data?.message;
      if (msg && (msg.includes('expired') || msg.includes('Invalid'))) {
          toast.error(t('errors.invalidLink'));
      } else {
          toast.error(t('errors.generic'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-slate-50 p-4">
        <div className="rounded-3xl bg-white p-8 text-center shadow-xl shadow-slate-200 border border-slate-100">
           <p className="text-lg font-bold text-red-500 mb-4">{t('errors.invalidLink')}</p>
           <button onClick={() => router.push('/login')} className="text-indigo-600 font-bold hover:underline">
             {t('errors.generic') /* Using a fallback back link if needed, or just hardcoded back text */}
             Back to Login
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-slate-900">{t('title')}</h1>
            <p className="mt-2 text-slate-600">{t('subtitle')}</p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-xl shadow-slate-200 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                {t('fields.newPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 rtl:right-3 rtl:left-auto" />
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rtl:pr-10 rtl:pl-10"
                />
                <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 rtl:left-3 rtl:right-auto"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                    {showNewPassword ? (
                        <EyeOff className="h-5 w-5" />
                    ) : (
                        <Eye className="h-5 w-5" />
                    )}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                  {t('errors.passwordTooShort')}
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                {t('fields.confirmPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 rtl:right-3 rtl:left-auto" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 rtl:pr-10 rtl:pl-10"
                />
                <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 rtl:left-3 rtl:right-auto"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                    {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                    ) : (
                        <Eye className="h-5 w-5" />
                    )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? (
                  <span className="flex items-center gap-2">
                      {t('button.processing')}
                  </span>
              ) : t('button.submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

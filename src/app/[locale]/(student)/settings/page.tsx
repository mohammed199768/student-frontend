'use client';

import { useState } from 'react';
import { Navbar } from '@/components/common/navbar';
import { Footer } from '@/components/common/footer';
import { Bell, Lock, Eye, EyeOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function SettingsPage() {
    const t = useTranslations('student.settings');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <Navbar />

            <main className="flex-1 py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl font-extrabold text-slate-900 mb-12">{t('title')}</h1>

                        <div className="space-y-8">
                            {/* Security */}
                            <div className="rounded-[40px] bg-white p-10 border border-slate-200 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                                    <Lock className="h-6 w-6 text-indigo-600" /> {t('security_title')}
                                </h3>
                                <div className="space-y-6 max-w-md">
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 block mb-2">{t('current_password')}</label>
                                        <div className="relative">
                                            <input type={showCurrentPassword ? 'text' : 'password'} placeholder="••••••••" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 pr-10 focus:border-indigo-600 focus:outline-none rtl:pl-10 rtl:pr-4" />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 rtl:left-3 rtl:right-auto"
                                                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff className="h-5 w-5" />
                                                ) : (
                                                    <Eye className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 block mb-2">{t('new_password')}</label>
                                        <div className="relative">
                                            <input type={showNewPassword ? 'text' : 'password'} placeholder="••••••••" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 pr-10 focus:border-indigo-600 focus:outline-none rtl:pl-10 rtl:pr-4" />
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
                                    </div>
                                    <button className="rounded-2xl bg-slate-900 px-8 py-3 font-bold text-white hover:bg-slate-800 transition-colors">
                                        {t('update_password')}
                                    </button>
                                </div>
                            </div>

                            {/* Notifications */}
                            <div className="rounded-[40px] bg-white p-10 border border-slate-200 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                                    <Bell className="h-6 w-6 text-indigo-600" /> {t('notifications_title')}
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between py-4 border-b border-slate-50">
                                        <div>
                                            <p className="font-bold text-slate-900">{t('email_notifications')}</p>
                                            <p className="text-sm text-slate-500">{t('email_notifications_desc')}</p>
                                        </div>
                                        <div className="h-6 w-12 bg-indigo-600 rounded-full relative">
                                            <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-4 border-b border-slate-50">
                                        <div>
                                            <p className="font-bold text-slate-900">{t('browser_notifications')}</p>
                                            <p className="text-sm text-slate-500">{t('browser_notifications_desc')}</p>
                                        </div>
                                        <div className="h-6 w-12 bg-slate-200 rounded-full relative">
                                            <div className="absolute left-1 top-1 h-4 w-4 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

'use client';

import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useAuth } from '@/lib/contexts/auth-context';
import { useTranslations, useLocale } from 'next-intl';
import { Menu, X, Globe, User, LogOut, LayoutDashboard, Home, BookOpen, LogIn } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Navbar() {
    const t = useTranslations('common');
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const pathname = usePathname();
    const locale = useLocale();
    const router = useRouter();

    const toggleLanguage = () => {
        const nextLocale = locale === 'ar' ? 'en' : 'ar';
        router.replace(pathname, { locale: nextLocale });
    };

    const navLinks = [
        { href: '/', label: t('home') },
        { href: '/courses', label: t('courses') },
        { href: '/about', label: t('about') },
        { href: '/contact', label: t('contact') },
    ];

    const mobileQuickLinks = user
        ? [
            { href: '/', label: t('home'), icon: Home },
            { href: '/courses', label: t('courses'), icon: BookOpen },
            { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
            { href: '/profile', label: t('profile'), icon: User },
        ]
        : [
            { href: '/', label: t('home'), icon: Home },
            { href: '/courses', label: t('courses'), icon: BookOpen },
            { href: '/login', label: t('login'), icon: LogIn },
            { href: '/register', label: t('register'), icon: User },
        ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-900/80 backdrop-blur-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <Link href="/" className="text-2xl font-bold text-white">
                            {t('brand_p1')}<span className="text-indigo-400">{t('brand_p2')}</span>
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        'text-sm font-medium transition-all duration-200 hover:text-indigo-400 hover:scale-105',
                                        pathname === link.href ? 'text-indigo-400 font-bold' : 'text-slate-300'
                                    )}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleLanguage}
                            className="rounded-full p-2 text-slate-300 hover:bg-white/10 hover:text-indigo-400"
                        >
                            <Globe className="h-5 w-5" />
                        </button>

                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/dashboard"
                                    className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-indigo-400"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    <span>{t('dashboard')}</span>
                                </Link>
                                <div className="relative">
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center gap-2 rounded-full border border-white/10 p-1 pr-3 hover:bg-white/5 rtl:pl-3 rtl:pr-1 transition-colors"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-200 hidden sm:inline-block">
                                            {user.fullName?.split(' ')[0] || ''}
                                        </span>
                                    </button>
                                    {isUserMenuOpen && (
                                        <div className="absolute left-0 mt-2 w-48 rounded-xl border border-white/10 bg-slate-900 p-2 shadow-xl rtl:left-auto rtl:right-0">
                                            <Link
                                                href="/profile"
                                                className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-indigo-400"
                                            >
                                                <User className="h-4 w-4" />
                                                <span>{t('profile')}</span>
                                            </Link>
                                            <button
                                                onClick={() => logout()}
                                                className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                <span>{t('logout')}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-3">
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-slate-300 hover:text-indigo-400"
                                >
                                    {t('login')}
                                </Link>
                                <Link
                                    href="/register"
                                    className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/30"
                                >
                                    {t('register')}
                                </Link>
                            </div>
                        )}

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden rounded-full p-2 text-slate-300 hover:bg-white/10"
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-white/5 bg-slate-900 px-4 py-6">
                    <div className="flex flex-col space-y-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-lg font-medium text-slate-300 hover:text-indigo-400"
                            >
                                {link.label}
                            </Link>
                        ))}
                        {user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-lg font-medium text-slate-300 hover:text-indigo-400"
                                >
                                    {t('dashboard')}
                                </Link>
                                <Link
                                    href="/profile"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-lg font-medium text-slate-300 hover:text-indigo-400"
                                >
                                    {t('profile')}
                                </Link>
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        logout();
                                    }}
                                    className="text-start text-lg font-medium text-red-400 hover:text-red-300"
                                >
                                    {t('logout')}
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-3 pt-2">
                                <Link
                                    href="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-sm font-medium text-slate-300 hover:text-indigo-400"
                                >
                                    {t('login')}
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
                                >
                                    {t('register')}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="md:hidden border-t border-white/5 bg-slate-900/95 px-2 py-2">
                <div className="grid grid-cols-4 gap-1">
                    {mobileQuickLinks.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition-colors',
                                    isActive ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-300 hover:bg-white/5'
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                <span className="line-clamp-1">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}

'use client';

import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useAuth } from '@/lib/contexts/auth-context';
import { useTranslations, useLocale } from 'next-intl';
import {
    Globe,
    User,
    LogOut,
    LayoutDashboard,
    Home,
    BookOpen,
    LogIn,
    MessageCircle,
    Menu,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Navbar() {
    const t = useTranslations('common');
    const { user, logout } = useAuth();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
    const pathname = usePathname();
    const locale = useLocale();
    const router = useRouter();

    const toggleLanguage = () => {
        const nextLocale = locale === 'ar' ? 'en' : 'ar';
        router.replace(pathname, { locale: nextLocale });
        setIsMobileMoreOpen(false);
    };

    const desktopNavLinks = [
        { href: '/', label: t('home') },
        { href: '/courses', label: t('courses') },
        { href: '/contact', label: t('contact') },
    ];

    const mobilePrimaryLinks = user
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
        <>
            {/* Desktop Navbar Only */}
            <nav className="sticky top-0 z-50 hidden w-full border-b border-white/5 bg-slate-900/80 backdrop-blur-md md:block">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center">
                            <Link href="/" className="text-2xl font-bold text-white">
                                {t('brand_p1')}
                                <span className="text-indigo-400">{t('brand_p2')}</span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-8">
                            {desktopNavLinks.map((link) => (
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
                                        className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-indigo-400"
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
                                <div className="flex items-center gap-3">
                                    <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-indigo-400">
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
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile More Sheet */}
            {isMobileMoreOpen && (
                <div className="fixed inset-x-0 bottom-20 z-50 border-t border-white/10 bg-slate-900/95 p-4 backdrop-blur-md md:hidden">
                    <div className="grid grid-cols-2 gap-2">
                        <Link
                            href="/contact"
                            onClick={() => setIsMobileMoreOpen(false)}
                            className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-3 text-sm font-medium text-slate-200"
                        >
                            <MessageCircle className="h-4 w-4" />
                            {t('contact')}
                        </Link>
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-3 text-sm font-medium text-slate-200"
                        >
                            <Globe className="h-4 w-4" />
                            {locale === 'ar' ? 'English' : '???????'}
                        </button>
                        {user ? (
                            <button
                                onClick={() => {
                                    setIsMobileMoreOpen(false);
                                    logout();
                                }}
                                className="flex items-center gap-2 rounded-xl bg-red-500/10 px-3 py-3 text-sm font-medium text-red-300"
                            >
                                <LogOut className="h-4 w-4" />
                                {t('logout')}
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                onClick={() => setIsMobileMoreOpen(false)}
                                className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-3 text-sm font-medium text-slate-200"
                            >
                                <LogIn className="h-4 w-4" />
                                {t('login')}
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* Mobile Bottom Navigation Only */}
            <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-900/95 px-2 py-2 backdrop-blur-md md:hidden">
                <div className="grid grid-cols-5 gap-1">
                    {mobilePrimaryLinks.map((item) => {
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
                    <button
                        onClick={() => setIsMobileMoreOpen((prev) => !prev)}
                        className={cn(
                            'flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition-colors',
                            isMobileMoreOpen ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-300 hover:bg-white/5'
                        )}
                    >
                        {isMobileMoreOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                        <span>{locale === 'ar' ? 'المزيد' : 'More'}</span>
                    </button>
                </div>
            </nav>
        </>
    );
}

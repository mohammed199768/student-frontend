'use client';

import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useAuth } from '@/lib/contexts/auth-context';
import { useTranslations, useLocale } from 'next-intl';
import {
    Languages,
    User,
    UserPlus,
    LogOut,
    LayoutDashboard,
    BookOpen,
    LogIn,
    MessageCircle,
    Menu,
    X,
    Sun,
    Moon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { useTheme } from 'next-themes';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const detectSafari = () => {
    if (typeof navigator === 'undefined') return false;
    const userAgent = navigator.userAgent;
    return /Safari/i.test(userAgent) && !/Chrome|Chromium|CriOS|Edg|OPR|OPiOS|FxiOS/i.test(userAgent);
};

const detectReducedMotion = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(REDUCED_MOTION_QUERY).matches;
};

export function Navbar() {
    const t = useTranslations('common');
    const { user, logout } = useAuth();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(detectReducedMotion);
    const pathname = usePathname();
    const locale = useLocale();
    const router = useRouter();
    const { resolvedTheme, setTheme } = useTheme();
    const isSafari = detectSafari();

    useEffect(() => {
        const motionMedia = window.matchMedia(REDUCED_MOTION_QUERY);
        const updateMotionPreference = (event: MediaQueryListEvent | MediaQueryList) => setPrefersReducedMotion(event.matches);

        if (typeof motionMedia.addEventListener === 'function') {
            motionMedia.addEventListener('change', updateMotionPreference);
        } else {
            motionMedia.addListener(updateMotionPreference);
        }

        return () => {
            if (typeof motionMedia.removeEventListener === 'function') {
                motionMedia.removeEventListener('change', updateMotionPreference);
            } else {
                motionMedia.removeListener(updateMotionPreference);
            }
        };
    }, []);

    const scrollToHero = () => {
        if (typeof window === 'undefined') return;
        const heroSection = document.getElementById('hero-section');
        const behavior: ScrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';
        if (heroSection) {
            heroSection.scrollIntoView({ behavior, block: 'start' });
            return;
        }
        window.scrollTo({ top: 0, behavior });
    };

    const toggleLanguage = () => {
        const nextLocale = locale === 'ar' ? 'en' : 'ar';
        router.replace(pathname, { locale: nextLocale });
        setIsMobileMoreOpen(false);
    };

    const toggleTheme = () => {
        const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
    };

    const desktopNavLinks = [
        { href: '/', label: t('home') },
        { href: '/courses', label: t('courses') },
        { href: '/contact', label: t('contact') },
    ];

    return (
        <>
            {/* Desktop Navbar Only */}
            <nav
                className={cn(
                    'sticky top-0 z-50 hidden w-full border-b border-slate-100 dark:border-white/5 md:block',
                    isSafari ? 'bg-white/98 dark:bg-slate-900/95' : 'bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm'
                )}
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center">
                                <span className="inline-flex items-center justify-center rounded-xl p-1.5 bg-[#1e3a5f] dark:bg-transparent">
                                    <Image
                                        src="/manal-logo.png"
                                        width={102}
                                        height={23}
                                        alt="Manal LMS Logo"
                                        sizes="140px"
                                        className="object-contain"
                                    />
                                </span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-8">
                            {desktopNavLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        'text-sm font-medium transition-all duration-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-105',
                                        pathname === link.href ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                                    )}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center gap-4">
                            <ThemeToggle />
                            <button
                                onClick={toggleLanguage}
                                aria-label="تغيير اللغة / Switch Language"
                                className="rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-white/10 hover:text-indigo-600 dark:hover:text-indigo-400"
                            >
                                <Languages className="h-5 w-5" />
                            </button>

                            {user ? (
                                <div className="flex items-center gap-4">
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-400"
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        <span>{t('dashboard')}</span>
                                    </Link>
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                            className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 p-1 pr-3 hover:bg-slate-100 dark:hover:bg-white/5 rtl:pl-3 rtl:pr-1 transition-colors"
                                        >
                                            <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200 hidden sm:inline-block">
                                                {user.fullName?.split(' ')[0] || ''}
                                            </span>
                                        </button>
                                        {isUserMenuOpen && (
                                            <div className="absolute left-0 mt-2 w-48 rounded-xl border border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900 p-2 shadow-lg shadow-slate-200/50 dark:shadow-black/40 rtl:left-auto rtl:right-0">
                                                <Link
                                                    href="/profile"
                                                    className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-indigo-400"
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
                                <div className="inline-flex items-center rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-1">
                                    <Link
                                        href="/login"
                                        className={cn(
                                            'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all',
                                            pathname === '/login'
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-indigo-300'
                                        )}
                                    >
                                        <LogIn className="h-4 w-4" />
                                        {t('login')}
                                    </Link>
                                    <Link
                                        href="/register"
                                        className={cn(
                                            'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all',
                                            pathname === '/register'
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-indigo-300'
                                        )}
                                    >
                                        <UserPlus className="h-4 w-4" />
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
                <div className="fixed inset-x-3 bottom-[5.7rem] z-50 rounded-[1.6rem] border border-slate-100 dark:border-white/10 bg-white/98 dark:bg-slate-900/95 p-3 shadow-2xl shadow-black/40 md:hidden">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2 inline-flex items-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-1">
                            <Link
                                href="/login"
                                onClick={() => setIsMobileMoreOpen(false)}
                                className={cn(
                                    'flex-1 rounded-lg px-3 py-2.5 text-center text-sm font-semibold transition-all',
                                    pathname === '/login'
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10'
                                )}
                            >
                                <span className="inline-flex items-center gap-1.5">
                                    <LogIn className="h-4 w-4" />
                                    {t('login')}
                                </span>
                            </Link>
                            <Link
                                href="/register"
                                onClick={() => setIsMobileMoreOpen(false)}
                                className={cn(
                                    'flex-1 rounded-lg px-3 py-2.5 text-center text-sm font-semibold transition-all',
                                    pathname === '/register'
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10'
                                )}
                            >
                                <span className="inline-flex items-center gap-1.5">
                                    <UserPlus className="h-4 w-4" />
                                    {t('register')}
                                </span>
                            </Link>
                        </div>
                        <button
                            onClick={toggleLanguage}
                            className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-100 dark:hover:bg-white/10"
                        >
                            <Languages className="h-4 w-4" />
                            <span>{locale === 'ar' ? 'English' : 'العربية'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Mobile Bottom Navigation Only */}
            <nav className="fixed inset-x-3 bottom-3 z-50 isolate rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white/98 dark:bg-slate-900/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-2xl shadow-black/40 md:hidden">
                <div className="grid grid-cols-5 gap-1">
                    <Link
                        href="/courses"
                        className={cn(
                            'flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition-colors',
                            pathname === '/courses' || pathname.startsWith('/courses/')
                                ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                        )}
                    >
                        <BookOpen className="h-4 w-4" />
                        <span className="line-clamp-1">{t('courses')}</span>
                    </Link>

                    <Link
                        href="/contact"
                        className={cn(
                            'flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition-colors',
                            pathname === '/contact' || pathname.startsWith('/contact/')
                                ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                        )}
                    >
                        <MessageCircle className="h-4 w-4" />
                        <span className="line-clamp-1">{t('contact')}</span>
                    </Link>

                    <Link
                        href="/#hero-section"
                        aria-label={t('home')}
                        onClick={(event) => {
                            setIsMobileMoreOpen(false);
                            if (pathname === '/') {
                                event.preventDefault();
                                scrollToHero();
                            }
                        }}
                            className={cn(
                                'group relative -mt-9 flex h-16 w-16 items-center justify-center self-start justify-self-center rounded-full border border-white/25 bg-linear-to-b from-indigo-500 to-indigo-700 shadow-xl shadow-indigo-900/70',
                                prefersReducedMotion ? 'transition-none' : 'transition-all active:scale-90',
                                pathname === '/' && 'ring-2 ring-indigo-300/40 ring-offset-2 ring-offset-slate-100 dark:ring-offset-slate-900'
                            )}
                        >
                        <Image
                            src="/favicon.webp"
                            alt="Manal"
                            width={30}
                            height={30}
                            className="rounded-full object-cover"
                        />
                        <span
                            className={cn(
                                'pointer-events-none absolute inset-0 rounded-full border border-indigo-200/40',
                                prefersReducedMotion
                                    ? 'transition-none'
                                    : 'transition-all duration-150 group-active:scale-110 group-active:opacity-0'
                            )}
                        />
                    </Link>

                    <button
                        onClick={toggleTheme}
                        aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        className="flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                        {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        <span className="line-clamp-1">{locale === 'ar' ? 'الوضع' : 'Mode'}</span>
                    </button>

                    <button
                        onClick={() => setIsMobileMoreOpen((prev) => !prev)}
                        className={cn(
                            'flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition-colors',
                            isMobileMoreOpen ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                        )}
                    >
                        {isMobileMoreOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                        <span>More</span>
                    </button>
                </div>
            </nav>
        </>
    );
}

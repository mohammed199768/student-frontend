import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { AuthProvider } from '@/lib/contexts/auth-context';
import { QueryProvider } from '@/components/providers/query-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from 'react-hot-toast';
import { PwaRegister } from '@/components/common/pwa-register';
import { Preloader } from '@/components/common/preloader';
import { RouteLoader } from '@/components/common/route-loader';
import '@/app/globals.css';

const BRAND_KEYWORDS = [
    'منال',
    'منال الحيحي',
    'منال الحيحي دورات',
    'دورات منال',
    'manal',
    'manal alhihi',
    'manal alhihi educational platform',
    'منصة منال الحيحي التعليمية',
    't.manal',
    't manal',
    'manal platform',
    'ksu',
    'ksu courses',
    'prince sultan',
    'prince sultan university',
    'جامعة الأمير سلطان',
    'جامعة الملك سعود',
    'دورات جامعة الملك سعود',
    'السعودية',
    'الرياض',
    'الخليج',
    'دورات جامعية السعودية',
    'منصة منال التعليمية',
    'منصة منال',
    'منصة تعليمية',
    'منصة',
];

const metadataBaseConfig: Metadata = {
    metadataBase: new URL('https://www.manalalhihi.com'),
    title: {
        default: 'Manal Alhihi Educational Platform',
        template: '%s | Manal Alhihi Educational Platform',
    },
    description: 'Manal Alhihi Educational Platform - The premier platform for online learning, university courses, and KSU-focused educational content in Saudi Arabia and the Gulf.',
    applicationName: 'Manal Alhihi Educational Platform',
    authors: [{ name: 'Mohammed Aldomi' }],
    creator: 'Mohammed Aldomi',
    publisher: 'Manal Alhihi Educational Platform',
    keywords: BRAND_KEYWORDS,
    manifest: '/manifest.webmanifest',
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
        },
    },
    openGraph: {
        title: 'Manal Alhihi Educational Platform',
        description: 'Manal Alhihi Educational Platform - Empowering students in Saudi Arabia and the Gulf with top-tier university courses.',
        url: 'https://www.manalalhihi.com',
        siteName: 'Manal Alhihi Educational Platform',
        type: 'website',
        images: [
            {
                url: '/favicon.webp',
                width: 512,
                height: 512,
                alt: 'Manal Alhihi Educational Platform Logo',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Manal Alhihi Educational Platform',
        description: 'Manal Alhihi Educational Platform - Empowering students in Saudi Arabia and the Gulf with top-tier university courses.',
        creator: 'INKSPIRE',
        images: ['/favicon.webp'],
    },
    appleWebApp: {
        capable: true,
        title: 'Manal Alhihi Educational Platform',
        statusBarStyle: 'black-translucent',
    },
    icons: {
        icon: '/favicon.webp',
        shortcut: '/favicon.webp',
        apple: '/favicon.webp',
    },
};

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    await params;

    return {
        ...metadataBaseConfig,
    };
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: 'var(--bg-base)',
    colorScheme: 'light dark',
};

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!(routing.locales as readonly string[]).includes(locale)) {
        notFound();
    }

    const messages = await getMessages();
    const dir = locale === 'ar' ? 'rtl' : 'ltr';

    return (
        <html lang={locale} dir={dir} className="h-full" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(){try{var t=localStorage.getItem('manal-theme')||'dark';document.documentElement.classList.add(t);}catch(e){}})();`,
                    }}
                />
            </head>
            <body
                className="font-sans antialiased h-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                suppressHydrationWarning
            >
                <ThemeProvider>
                    <NextIntlClientProvider messages={messages} locale={locale}>
                        <QueryProvider>
                            <AuthProvider>
                                <Preloader />
                                <RouteLoader />
                                {children}
                                <Toaster position="top-center" />
                                <PwaRegister />
                            </AuthProvider>
                        </QueryProvider>
                    </NextIntlClientProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}

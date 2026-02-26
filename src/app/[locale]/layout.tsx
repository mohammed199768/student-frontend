import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { AuthProvider } from '@/lib/contexts/auth-context';
import { QueryProvider } from '@/components/providers/query-provider';
import { Toaster } from 'react-hot-toast';
import { PwaRegister } from '@/components/common/pwa-register';
import '@/app/globals.css';

export const metadata: Metadata = {
    metadataBase: new URL('https://www.manalalhihi.com'),
    title: {
        default: 'T.MANAL ALHIHI',
        template: '%s | T.MANAL ALHIHI',
    },
    description: 'Educational Platform',
    applicationName: 'T.MANAL LMS',
    authors: [{ name: 'INKSPIRE' }],
    creator: 'INKSPIRE',
    publisher: 'INKSPIRE',
    keywords: ['T.MANAL LMS', 'T.MANAL ALHIHI', 'INKSPIRE', 'T.MANL ALHIHI', 'Educational Platform', 'Online Learning', 'LMS'],
    manifest: '/manifest.webmanifest',
    alternates: {
        canonical: '/',
    },
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
        title: 'T.MANAL ALHIHI',
        description: 'Educational Platform',
        url: 'https://www.manalalhihi.com',
        siteName: 'T.MANAL LMS',
        type: 'website',
        images: [
            {
                url: '/favicon.webp',
                width: 512,
                height: 512,
                alt: 'T.MANAL LMS',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'T.MANAL ALHIHI',
        description: 'Educational Platform',
        creator: 'INKSPIRE',
        images: ['/favicon.webp'],
    },
    appleWebApp: {
        capable: true,
        title: 'T.MANAL LMS',
        statusBarStyle: 'black-translucent',
    },
    icons: {
        icon: '/favicon.webp',
        shortcut: '/favicon.webp',
        apple: '/favicon.webp',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#0f172a',
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
            <body
                className="font-sans antialiased h-full bg-slate-50 text-slate-900"
                suppressHydrationWarning
            >
                <NextIntlClientProvider messages={messages} locale={locale}>
                    <QueryProvider>
                        <AuthProvider>
                            {children}
                            <Toaster position="top-center" />
                            <PwaRegister />
                        </AuthProvider>
                    </QueryProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}

import type { Metadata } from 'next';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const safeLocale = locale === 'ar' ? 'ar' : 'en';

    return {
        alternates: {
            canonical: `https://www.manalalhihi.com/${safeLocale}/contact`,
            languages: {
                ar: 'https://www.manalalhihi.com/ar/contact',
                en: 'https://www.manalalhihi.com/en/contact',
            },
        },
    };
}

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}

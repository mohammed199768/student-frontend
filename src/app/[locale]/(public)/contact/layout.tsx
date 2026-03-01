import type { Metadata } from 'next';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const safeLocale = locale === 'ar' ? 'ar' : 'en';
    const isArabic = safeLocale === 'ar';
    const title = isArabic
        ? 'تواصل مع منال الحيحي'
        : 'Contact Manal Alhihi';
    const description = isArabic
        ? 'صفحة التواصل الرسمية مع منصة منال الحيحي للدورات الجامعية والتعليم الإلكتروني.'
        : 'Official contact page for the Manal Alhihi learning platform and university courses.';
    const keywords = isArabic
        ? ['تواصل منال الحيحي', 'منال', 'منال الحيحي', 'دعم منال']
        : ['contact manal', 'manal alhihi', 't.manal support'];

    return {
        title,
        description,
        keywords,
        alternates: {
            canonical: `https://www.manalalhihi.com/${safeLocale}/contact`,
            languages: {
                ar: 'https://www.manalalhihi.com/ar/contact',
                en: 'https://www.manalalhihi.com/en/contact',
            },
        },
        openGraph: {
            title,
            description,
            url: `https://www.manalalhihi.com/${safeLocale}/contact`,
        },
        twitter: {
            title,
            description,
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

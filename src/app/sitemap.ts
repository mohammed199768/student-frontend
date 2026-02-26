import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.manalalhihi.com';
const LOCALES = ['ar', 'en'] as const;
const PUBLIC_PATHS = ['', '/about', '/contact', '/courses'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    return LOCALES.flatMap((locale) =>
        PUBLIC_PATHS.map((path) => ({
            url: `${BASE_URL}/${locale}${path}`,
            lastModified: now,
            changeFrequency: path === '' ? 'daily' : 'weekly',
            priority: path === '' ? 1 : 0.8,
        }))
    );
}


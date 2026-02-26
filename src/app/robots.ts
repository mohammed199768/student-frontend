import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/dashboard', '/profile', '/learn', '/enroll', '/settings'],
        },
        sitemap: 'https://www.manalalhihi.com/sitemap.xml',
        host: 'https://www.manalalhihi.com',
    };
}


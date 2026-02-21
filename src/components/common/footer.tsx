import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export function Footer() {
    const t = useTranslations('footer');
    const tc = useTranslations('common');
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-white/5 bg-slate-950 py-12 relative z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="text-2xl font-bold text-white">
                            {tc('brand_p1')}<span className="text-indigo-400">{tc('brand_p2')}</span>
                        </Link>
                        <p className="mt-4 max-w-xs text-slate-300">
                            {t('tagline')}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-white">{t('links_title')}</h3>
                        <ul className="mt-4 space-y-2">
                            <li>
                                <Link href="/courses" className="text-slate-300 hover:text-indigo-400 transition-colors">
                                    {tc('courses')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-slate-300 hover:text-indigo-400 transition-colors">
                                    {tc('contact')}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 border-t border-white/5 pt-8 text-center text-sm text-slate-400">
                    <p>(c) {year} {process.env.NEXT_PUBLIC_APP_NAME || 'Manal LMS'}. {t('rights')}</p>
                </div>
            </div>
        </footer>
    );
}

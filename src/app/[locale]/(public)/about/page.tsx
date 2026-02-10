import { Navbar } from '@/components/common/navbar';
import { Footer } from '@/components/common/footer';
import { BookOpen, Users, Trophy, Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AboutPage() {
    const t = useTranslations('about');

    return (
        <div className="flex min-h-screen flex-col bg-white">
            <Navbar />

            <main className="flex-1">
                {/* About Hero */}
                <section className="bg-slate-900 py-24 text-white">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-8">{t('title')}</h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            {t('description')}
                        </p>
                    </div>
                </section>

                {/* Vision Section */}
                <section className="py-24">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl font-extrabold text-slate-900 mb-8">{t('vision_title')}</h2>
                                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                                    {t('vision_desc1')}
                                </p>
                                <p className="text-lg text-slate-600 leading-relaxed">
                                    {t('vision_desc2')}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="rounded-3xl bg-slate-50 p-8 text-center border border-slate-100">
                                    <Users className="h-10 w-10 text-indigo-600 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold text-slate-900">+50,000</h3>
                                    <p className="text-sm text-slate-500">{t('stat_students')}</p>
                                </div>
                                <div className="rounded-3xl bg-slate-50 p-8 text-center border border-slate-100">
                                    <BookOpen className="h-10 w-10 text-indigo-600 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold text-slate-900">+2,000</h3>
                                    <p className="text-sm text-slate-500">{t('stat_courses')}</p>
                                </div>
                                <div className="rounded-3xl bg-slate-50 p-8 text-center border border-slate-100">
                                    <Globe className="h-10 w-10 text-indigo-600 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold text-slate-900">15</h3>
                                    <p className="text-sm text-slate-500">{t('stat_countries')}</p>
                                </div>
                                <div className="rounded-3xl bg-slate-50 p-8 text-center border border-slate-100">
                                    <Trophy className="h-10 w-10 text-indigo-600 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold text-slate-900">4.9/5</h3>
                                    <p className="text-sm text-slate-500">{t('stat_rating')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

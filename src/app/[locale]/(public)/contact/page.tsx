import { Navbar } from '@/components/common/navbar';
import { Footer } from '@/components/common/footer';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ContactPage() {
    const t = useTranslations('contact');

    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <Navbar />

            <main className="flex-1 py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto shadow-2xl rounded-[40px] bg-white overflow-hidden flex flex-col md:flex-row border border-slate-100">
                        <div className="md:w-2/5 bg-indigo-600 p-12 text-white">
                            <h2 className="text-3xl font-extrabold mb-8">{t('title')}</h2>
                            <p className="text-indigo-100 mb-12">{t('description')}</p>

                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-indigo-500/50 flex items-center justify-center">
                                        <Mail className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider">{t('email_label')}</p>
                                        <p className="font-bold">support@manallms.com</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-indigo-500/50 flex items-center justify-center">
                                        <Phone className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider">{t('phone_label')}</p>
                                        <p className="font-bold">+962 7XXXXXXXX</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-indigo-500/50 flex items-center justify-center">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider">{t('location_label')}</p>
                                        <p className="font-bold">{t('location_value')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 p-12">
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 block mb-2">{t('form_name')}</label>
                                        <input type="text" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 focus:border-indigo-600 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 block mb-2">{t('form_email')}</label>
                                        <input type="email" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 focus:border-indigo-600 focus:outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 block mb-2">{t('form_subject')}</label>
                                    <input type="text" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 focus:border-indigo-600 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 block mb-2">{t('form_message')}</label>
                                    <textarea rows={5} className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 focus:border-indigo-600 focus:outline-none"></textarea>
                                </div>
                                <button className="flex items-center justify-center gap-2 w-full rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700">
                                    <Send className="h-5 w-5" /> {t('form_submit')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

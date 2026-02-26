'use client';

import { FormEvent, useState } from 'react';
import { Navbar } from '@/components/common/navbar';
import { Footer } from '@/components/common/footer';
import { Mail, Phone, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api/client';
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP_DISPLAY, buildWhatsAppUrl } from '@/lib/constants/support';

const CONTACT_EMAIL = SUPPORT_EMAIL;
const CONTACT_PHONE = SUPPORT_WHATSAPP_DISPLAY;
const CONTACT_WHATSAPP_URL = buildWhatsAppUrl();

type ContactFormState = {
    name: string;
    email: string;
    subject: string;
    message: string;
};

const INITIAL_FORM_STATE: ContactFormState = {
    name: '',
    email: '',
    subject: '',
    message: '',
};

export default function ContactPage() {
    const t = useTranslations('contact');
    const [form, setForm] = useState<ContactFormState>(INITIAL_FORM_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onChange = (field: keyof ContactFormState, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
            toast.error(t('form_validation'));
            return;
        }

        setIsSubmitting(true);
        try {
            await apiClient.post('/contact', form);
            toast.success(t('form_success'));
            setForm(INITIAL_FORM_STATE);
        } catch (error: any) {
            const message = error?.response?.data?.message || t('form_error');
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <Navbar />

            <main className="flex-1 py-24">
                <div className="container mx-auto px-4">
                    <div className="mx-auto flex max-w-5xl flex-col overflow-hidden rounded-[40px] border border-slate-100 bg-white shadow-2xl md:flex-row">
                        <div className="p-12 text-white md:w-2/5 bg-indigo-600">
                            <h2 className="mb-8 text-3xl font-extrabold">{t('title')}</h2>
                            <p className="mb-12 text-indigo-100">{t('description')}</p>

                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/50">
                                        <Mail className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">{t('email_label')}</p>
                                        <p className="font-bold">{CONTACT_EMAIL}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/50">
                                        <Phone className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">{t('phone_label')}</p>
                                        <a
                                            href={CONTACT_WHATSAPP_URL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-bold underline underline-offset-2 hover:text-indigo-200 transition-colors"
                                        >
                                            {CONTACT_PHONE}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 p-12">
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-slate-700">{t('form_name')}</label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => onChange('name', e.target.value)}
                                            required
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-indigo-600 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-slate-700">{t('form_email')}</label>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => onChange('email', e.target.value)}
                                            required
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-indigo-600 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-slate-700">{t('form_subject')}</label>
                                    <input
                                        type="text"
                                        value={form.subject}
                                        onChange={(e) => onChange('subject', e.target.value)}
                                        required
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-indigo-600 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-slate-700">{t('form_message')}</label>
                                    <textarea
                                        rows={5}
                                        value={form.message}
                                        onChange={(e) => onChange('message', e.target.value)}
                                        required
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-indigo-600 focus:outline-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Send className="h-5 w-5" />
                                    {isSubmitting ? t('form_submit_loading') : t('form_submit')}
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

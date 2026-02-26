export const SUPPORT_EMAIL = 't.manalalhihi@gmail.com';
export const SUPPORT_WHATSAPP_DISPLAY = '00966502609789';
export const SUPPORT_WHATSAPP_NUMBER = '966502609789';

export const buildWhatsAppUrl = (message?: string): string => {
    const baseUrl = `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}`;
    if (!message) {
        return baseUrl;
    }
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
};

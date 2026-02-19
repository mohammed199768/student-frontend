import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency: string = 'SAR') {
    return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency,
    }).format(price);
}

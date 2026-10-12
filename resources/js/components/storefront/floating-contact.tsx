// resources/js/components/storefront/floating-contact.tsx
import { usePage } from '@inertiajs/react';
import { MessageCircle, Phone, X } from 'lucide-react';
import { themeColors } from '@/lib/theme-colors';
import type { AppSettings } from '@/types/settings';
import { useState, useEffect } from 'react';

export default function FloatingContact() {
    const { appSettings } = usePage().props as { appSettings: AppSettings };
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const phone =
        appSettings?.general?.whatsapp_number ??
        appSettings?.general?.support_phone;

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (!phone) return null;

    const whatsappHref = `https://wa.me/${phone.replace(/\D/g, '')}`;

    if (!isVisible) return null;

    return (
        <div className="fixed right-3 bottom-3 z-50 sm:right-5 sm:bottom-5">
            {isOpen && (
                <div className="absolute bottom-20 right-0 mb-2 flex flex-col gap-3 animate-in slide-in-from-bottom-5 fade-in duration-200">
                    <a
                        href={`tel:${phone}`}
                        className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 text-slate-700 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
                    >
                        <div
                            className="flex size-10 items-center justify-center rounded-full text-white"
                            style={{ backgroundColor: themeColors.primary }}
                        >
                            <Phone className="size-4" />
                        </div>
                        <span className="font-medium">Call Support</span>
                    </a>
                    <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-2xl bg-white px-5 py-3 text-slate-700 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
                    >
                        <div className="flex size-10 items-center justify-center rounded-full bg-green-500 text-white">
                            <MessageCircle className="size-4" />
                        </div>
                        <span className="font-medium">WhatsApp</span>
                    </a>
                </div>
            )}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group relative flex size-12 items-center justify-center rounded-full text-white shadow-2xl transition-all hover:scale-110 hover:shadow-3xl sm:size-14"
                style={{ backgroundColor: themeColors.button }}
                aria-label="Contact support"
            >
                {isOpen ? (
                    <X className="size-6" />
                ) : (
                    <MessageCircle className="size-6" />
                )}
                <span className="absolute -top-1 -right-1 flex size-4">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex size-4 rounded-full bg-green-500"></span>
                </span>
            </button>
        </div>
    );
}

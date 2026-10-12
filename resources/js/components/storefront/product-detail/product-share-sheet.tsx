import { Check, Link2, Mail, MessageSquare, MoreHorizontal, Share2, X } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useClipboard } from '@/hooks/use-clipboard';
import { useIsMobile } from '@/hooks/use-mobile';
import { mediaUrl } from '@/lib/media-url';
import { productShareUrl, whatsappShareHref } from '@/lib/share-url';
import { cn } from '@/lib/utils';

export type ProductSharePayload = {
    name: string;
    image: string;
    price: number;
    short_description?: string | null;
    category?: string;
};

type ProductShareSheetProps = {
    product: ProductSharePayload;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type ShareAction = {
    id: string;
    label: string;
    bg: string;
    icon: ReactNode;
    onClick: () => void | Promise<void>;
};

function WhatsAppIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );
}

function FacebookIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
        </svg>
    );
}

function MessengerIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
            <path d="M12 0C5.373 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.627 0 12-4.974 12-11.111C24 4.975 18.627 0 12 0zm1.193 14.963l-3.056-3.259-5.963 3.259L10.732 8.1l3.131 3.259L19.752 8.1l-6.559 6.863z" />
        </svg>
    );
}

function LinkedInIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
    );
}

function TelegramIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
            <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
    );
}

function openShareWindow(url: string, sameWindow = false) {
    if (sameWindow) {
        window.location.href = url;
        return;
    }

    window.open(url, '_blank', 'noopener,noreferrer,width=640,height=720');
}

export function ProductShareSheet({ product, open, onOpenChange }: ProductShareSheetProps) {
    const isMobile = useIsMobile();
    const { appUrl } = usePage().props as { appUrl?: string };
    const [, copy] = useClipboard();
    const [copied, setCopied] = useState(false);
    const [shareUrl, setShareUrl] = useState('');

    useEffect(() => {
        if (!open || typeof window === 'undefined') {
            return;
        }

        setShareUrl(productShareUrl(appUrl));
        setCopied(false);
    }, [open, appUrl]);

    const imageSrc = mediaUrl(product.image) ?? product.image;
    const shareText = useMemo(() => {
        const price = product.price.toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        });

        return `Check out ${product.name} on Mahadev — ${price}`;
    }, [product.name, product.price]);

    const currentShareUrl = shareUrl || (typeof window === 'undefined' ? '' : productShareUrl(appUrl));

    const handleCopy = async () => {
        const ok = await copy(currentShareUrl);
        if (ok) {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleNativeShare = async () => {
        const url = currentShareUrl;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.name,
                    text: `${shareText}\n\n${url}`,
                    url,
                });
                onOpenChange(false);
                return;
            } catch {
                // User cancelled or share failed — fall through to copy.
            }
        }

        await handleCopy();
    };

    const actions: ShareAction[] = [
        {
            id: 'copy',
            label: copied ? 'Copied' : 'Copy Link',
            bg: 'bg-[#2874F0]',
            icon: copied ? <Check className="h-5 w-5" /> : <Link2 className="h-5 w-5" />,
            onClick: handleCopy,
        },
        {
            id: 'whatsapp',
            label: 'WhatsApp',
            bg: 'bg-[#25D366]',
            icon: <WhatsAppIcon className="h-5 w-5" />,
            onClick: () => {
                openShareWindow(whatsappShareHref(shareText, currentShareUrl), isMobile);
            },
        },
        {
            id: 'facebook',
            label: 'Facebook',
            bg: 'bg-[#1877F2]',
            icon: <FacebookIcon className="h-5 w-5" />,
            onClick: () => {
                openShareWindow(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentShareUrl)}`,
                );
            },
        },
        {
            id: 'messenger',
            label: 'Messenger',
            bg: 'bg-[#0084FF]',
            icon: <MessengerIcon className="h-5 w-5" />,
            onClick: () => {
                if (isMobile) {
                    window.location.href = `fb-messenger://share/?link=${encodeURIComponent(currentShareUrl)}`;
                    return;
                }
                openShareWindow(
                    `https://www.facebook.com/dialog/send?link=${encodeURIComponent(currentShareUrl)}&redirect_uri=${encodeURIComponent(currentShareUrl)}`,
                );
            },
        },
        {
            id: 'gmail',
            label: 'Gmail',
            bg: 'bg-[#EA4335]',
            icon: <Mail className="h-5 w-5" />,
            onClick: () => {
                window.location.href = `mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent(`${shareText}\n\n${currentShareUrl}`)}`;
            },
        },
        {
            id: 'sms',
            label: 'SMS',
            bg: 'bg-[#34B7F1]',
            icon: <MessageSquare className="h-5 w-5" />,
            onClick: () => {
                const body = encodeURIComponent(`${shareText}\n\n${currentShareUrl}`);
                window.location.href = `sms:?&body=${body}`;
            },
        },
        {
            id: 'linkedin',
            label: 'LinkedIn',
            bg: 'bg-[#0A66C2]',
            icon: <LinkedInIcon className="h-5 w-5" />,
            onClick: () => {
                openShareWindow(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentShareUrl)}`,
                );
            },
        },
        {
            id: 'telegram',
            label: 'Telegram',
            bg: 'bg-[#229ED9]',
            icon: <TelegramIcon className="h-5 w-5" />,
            onClick: () => {
                openShareWindow(
                    `https://t.me/share/url?url=${encodeURIComponent(currentShareUrl)}&text=${encodeURIComponent(shareText)}`,
                );
            },
        },
        {
            id: 'more',
            label: 'More',
            bg: 'bg-slate-500',
            icon: <MoreHorizontal className="h-5 w-5" />,
            onClick: handleNativeShare,
        },
    ];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side={isMobile ? 'bottom' : 'right'}
                className={cn(
                    'gap-0 overflow-y-auto border-slate-200 bg-white p-0 [&>button]:hidden',
                    isMobile
                        ? 'max-h-[85dvh] rounded-t-2xl pb-[max(1rem,env(safe-area-inset-bottom))]'
                        : 'w-full sm:max-w-[360px]',
                )}
            >
                {isMobile && (
                    <div className="flex justify-center pt-3" aria-hidden="true">
                        <span className="h-1 w-10 rounded-full bg-slate-300" />
                    </div>
                )}

                <SheetHeader className="relative border-b border-slate-100 px-4 py-3.5 text-left">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="absolute top-3.5 left-3 grid h-8 w-8 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100"
                        aria-label="Close share"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    <SheetTitle className="pl-9 text-base font-semibold text-neutral-900">
                        Share
                    </SheetTitle>
                    <SheetDescription className="sr-only">
                        Share {product.name} via social apps or copy the product link
                    </SheetDescription>
                </SheetHeader>

                <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-slate-100">
                        {imageSrc ? (
                            <img
                                src={imageSrc}
                                alt=""
                                className="h-full w-full object-cover object-top"
                            />
                        ) : (
                            <div className="grid h-full w-full place-items-center text-slate-300">
                                <Share2 className="h-5 w-5" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-neutral-900">
                            {product.name}
                        </p>
                        {product.short_description ? (
                            <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                                {product.short_description}
                            </p>
                        ) : (
                            <p className="mt-0.5 text-xs text-slate-500">{product.category}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-x-2 gap-y-5 px-4 py-5 sm:grid-cols-3">
                    {actions.map((action) => (
                        <button
                            key={action.id}
                            type="button"
                            onClick={() => void action.onClick()}
                            className="flex flex-col items-center gap-2 text-center"
                        >
                            <span
                                className={cn(
                                    'grid h-12 w-12 place-items-center rounded-full text-white shadow-sm transition hover:opacity-90 active:scale-95',
                                    action.bg,
                                )}
                            >
                                {action.icon}
                            </span>
                            <span className="max-w-[88px] text-[11px] leading-tight font-medium text-slate-700">
                                {action.label}
                            </span>
                        </button>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    );
}

type ProductShareButtonProps = {
    product: ProductSharePayload;
    className?: string;
};

export function ProductShareButton({ product, className }: ProductShareButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={cn(
                    'grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-neutral-800 shadow-sm transition hover:border-neutral-400',
                    className,
                )}
                aria-label="Share product"
            >
                <Share2 className="h-4 w-4" />
            </button>
            <ProductShareSheet product={product} open={open} onOpenChange={setOpen} />
        </>
    );
}

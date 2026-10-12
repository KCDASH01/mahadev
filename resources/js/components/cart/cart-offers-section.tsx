import { router, usePage } from '@inertiajs/react';
import { Tag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type CartOffer = {
    id: number;
    code: string;
    title: string;
    description: string;
    type: string;
    minimum_amount: number;
};

type CartOffersSectionProps = {
    offers: CartOffer[];
    appliedCoupon: { id: number; code: string; title: string } | null;
};

export function CartOffersSection({ offers, appliedCoupon }: CartOffersSectionProps) {
    const { auth, errors } = usePage().props as {
        auth?: { user?: unknown };
        errors?: Record<string, string>;
    };
    const [couponInput, setCouponInput] = useState(appliedCoupon?.code ?? '');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        setCouponInput(appliedCoupon?.code ?? '');
    }, [appliedCoupon?.code]);

    const applyCoupon = (code: string) => {
        const normalized = code.trim();

        if (!normalized) {
            return;
        }

        setProcessing(true);
        router.post(
            '/cart/coupon',
            { code: normalized },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            },
        );
    };

    const removeCoupon = () => {
        setProcessing(true);
        router.post('/cart/coupon/remove', {}, {
            preserveScroll: true,
            onFinish: () => {
                setCouponInput('');
                setProcessing(false);
            },
        });
    };

    return (
        <div className="border border-[#E8DDC5] bg-white p-5 sm:p-6">
            <h2 className="font-serif text-xl font-medium text-[#09233D]">Available Offers</h2>

            {offers.length > 0 ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {offers.map((offer) => (
                        <button
                            key={offer.id}
                            type="button"
                            disabled={processing}
                            onClick={() => applyCoupon(offer.code)}
                            className={`border p-4 text-left transition hover:border-[#062A4D] disabled:opacity-60 ${
                                appliedCoupon?.code === offer.code
                                    ? 'border-[#062A4D] bg-[#F5F1E8]'
                                    : 'border-[#E8DDC5] bg-[#FCFAF5]'
                            }`}
                        >
                            <p className="flex items-center gap-2 text-sm font-semibold text-[#09233D]">
                                <Tag className="h-4 w-4 text-[#062A4D]" />
                                {offer.title}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-[#647487]">{offer.description}</p>
                            <p className="mt-2 text-[11px] font-medium tracking-[0.14em] text-[#062A4D] uppercase">
                                Code: {offer.code}
                            </p>
                        </button>
                    ))}
                </div>
            ) : (
                <p className="mt-4 text-sm text-[#647487]">No active offers right now.</p>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Tag className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#647487]" />
                    <Input
                        value={couponInput}
                        onChange={(event) => setCouponInput(event.target.value)}
                        placeholder="Enter coupon code"
                        className="h-11 rounded-none border-[#E8DDC5] bg-white pr-4 pl-11 focus-visible:border-[#062A4D] focus-visible:ring-[#062A4D]/15"
                    />
                </div>
                {appliedCoupon ? (
                    <Button
                        type="button"
                        variant="outline"
                        disabled={processing}
                        onClick={removeCoupon}
                        className="h-11 shrink-0 rounded-none border-[#062A4D] px-6 text-[11px] font-medium tracking-[0.16em] text-[#062A4D] uppercase hover:bg-[#062A4D] hover:text-[#FCFAF5]"
                    >
                        Remove
                    </Button>
                ) : (
                    <Button
                        type="button"
                        disabled={processing}
                        onClick={() => applyCoupon(couponInput)}
                        className="h-11 shrink-0 rounded-none bg-[#062A4D] px-6 text-[11px] font-medium tracking-[0.16em] text-[#FCFAF5] uppercase hover:bg-[#041F3A]"
                    >
                        Apply
                    </Button>
                )}
            </div>

            {appliedCoupon && (
                <p className="mt-3 text-sm font-semibold text-emerald-700">
                    Coupon {appliedCoupon.code} applied successfully.
                </p>
            )}

            {errors?.code && <p className="mt-3 text-sm text-rose-600">{errors.code}</p>}

            {!auth?.user && (
                <p className="mt-3 text-xs text-[#647487]">
                    Some coupons may require you to log in at checkout.
                </p>
            )}
        </div>
    );
}

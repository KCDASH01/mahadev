import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Banknote, CreditCard, MapPin, ShoppingBag, Truck } from 'lucide-react';
import { useState } from 'react';
import { CartAddressSection, type UserAddress } from '@/components/cart/cart-address-section';
import InputError from '@/components/input-error';
import { HomeBrandMotif } from '@/components/home/home-brand-motif';
import { HomeFooter } from '@/components/home/home-footer';
import { HomeHeader } from '@/components/home/home-header';
import { formatPrice } from '@/data/fashion-products';
import { homeBrand } from '@/data/home-brand';
import { checkoutActionCtaClass } from '@/lib/commerce-cta';
import { displaySizeLabel } from '@/lib/size-label';
import { toast } from 'sonner';

type CartTotals = {
    subtotal: number;
    productDiscount: number;
    couponDiscount: number;
    shipping: number;
    shippingLabel: string;
    taxLabel: string;
    grandTotal: number;
    totalSavings: number;
};

type CheckoutItem = {
    key: string;
    product: { name: string; productType?: 'clothing' | 'jewellery' };
    size: string;
    color: string;
    quantity: number;
};

type CheckoutIndexProps = {
    checkoutMode?: 'cart' | 'buy_now';
    cartTotals: CartTotals;
    cartItems: CheckoutItem[];
    addresses: UserAddress[];
    selectedAddressId: number | null;
    appliedCoupon: { code: string; title: string } | null;
    codEnabled: boolean;
    estimatedDeliveryDate: string | null;
    deliveryDays: number;
    preferredPaymentMethod?: 'razorpay' | 'cod' | null;
};

type PaymentMethod = 'razorpay' | 'cod';

function checkoutItemMeta(item: CheckoutItem): string {
    const parts: string[] = [];

    if (item.product.productType !== 'jewellery') {
        if (item.size) {
            parts.push(`Size ${displaySizeLabel(item.size)}`);
        }

        if (item.color) {
            parts.push(item.color);
        }
    }

    parts.push(`Qty ${item.quantity}`);

    return parts.join(' · ');
}

function CheckoutMobilePayBar({
    grandTotal,
    method,
    processing,
    hasAddress,
    onPlaceOrder,
}: {
    grandTotal: number;
    method: PaymentMethod;
    processing: boolean;
    hasAddress: boolean;
    onPlaceOrder: () => void;
}) {
    const buttonLabel = processing ? 'Processing...' : method === 'cod' ? 'Place Order' : 'Pay Now';

    return (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E8DDC5] bg-[#FCFAF5]/95 p-3 shadow-[0_-8px_24px_rgba(74,18,28,0.08)] backdrop-blur-md lg:hidden">
            <div className="mx-auto flex max-w-lg items-center gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium tracking-[0.18em] text-[#647487] uppercase">Total</p>
                    <p className="text-xl font-semibold text-[#062A4D]">{formatPrice(grandTotal)}</p>
                </div>
                <button
                    type="button"
                    disabled={processing || !hasAddress}
                    onClick={onPlaceOrder}
                    className={`h-11 shrink-0 px-5 text-[11px] ${checkoutActionCtaClass(method)}`}
                >
                    {method === 'razorpay' && <CreditCard className="h-4 w-4" />}
                    {buttonLabel}
                </button>
            </div>
        </div>
    );
}

export default function CheckoutIndex({
    checkoutMode = 'cart',
    cartTotals,
    cartItems,
    addresses,
    selectedAddressId,
    appliedCoupon,
    codEnabled,
    estimatedDeliveryDate,
    preferredPaymentMethod = null,
}: CheckoutIndexProps) {
    const { errors } = usePage().props as { errors?: Record<string, string> };
    const [method, setMethod] = useState<PaymentMethod>(() => {
        if (preferredPaymentMethod === 'cod' && codEnabled) {
            return 'cod';
        }

        return 'razorpay';
    });
    const [processing, setProcessing] = useState(false);

    const isBuyNow = checkoutMode === 'buy_now';
    const address = addresses.find((item) => item.id === selectedAddressId) ?? addresses[0] ?? null;

    const placeOrder = () => {
        if (!address) {
            toast.error('Please add and select a delivery address before placing your order.');
            return;
        }

        setProcessing(true);
        router.post(
            '/checkout',
            { payment_method: method },
            {
                preserveScroll: true,
                onError: (fieldErrors) => {
                    const message =
                        fieldErrors.checkout ||
                        fieldErrors.address_id ||
                        fieldErrors.payment_method ||
                        'Unable to place your order. Please try again.';

                    toast.error(message);
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <>
            <Head title={`Checkout - ${homeBrand.name}`} />

            <div className="min-h-screen bg-[#FCFAF5] pb-20 font-sans text-[#09233D] antialiased lg:pb-0">
                <HomeHeader />

                <main className="mx-auto max-w-6xl px-4 py-8 pt-home-header sm:px-6 sm:py-12 lg:px-8">
                    <Link
                        href={isBuyNow ? '/' : '/cart'}
                        className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.14em] text-[#062A4D] uppercase transition hover:text-[#041F3A]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {isBuyNow ? 'Continue Shopping' : 'Back to Cart'}
                    </Link>

                    <div className="mt-6">
                        <p className="text-[11px] font-medium tracking-[0.28em] text-[#062A4D] uppercase">Checkout</p>
                        <h1 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#09233D] sm:text-4xl">
                            {isBuyNow ? 'Buy Now Checkout' : 'Select Payment Method'}
                        </h1>
                        <HomeBrandMotif className="mx-0 mt-4" />
                        {isBuyNow && (
                            <p className="mt-3 text-sm text-[#647487]">
                                You are checking out a single item. Your cart is unchanged.
                            </p>
                        )}
                    </div>

                    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
                        <div className="space-y-6">
                            {isBuyNow ? (
                                <CartAddressSection addresses={addresses} selectedAddressId={selectedAddressId} />
                            ) : address ? (
                                <section className="border border-[#E8DDC5] bg-white p-6">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <MapPin className="h-5 w-5 text-[#062A4D]" />
                                            <h2 className="text-[11px] font-medium tracking-[0.18em] text-[#062A4D] uppercase">
                                                Delivery Address
                                            </h2>
                                        </div>
                                        <Link
                                            href="/cart"
                                            className="text-[11px] font-medium tracking-[0.14em] text-[#062A4D] uppercase hover:underline"
                                        >
                                            Change
                                        </Link>
                                    </div>
                                    <div className="mt-4 text-sm leading-6 text-[#647487]">
                                        <p className="font-semibold text-[#09233D]">{address.full_name}</p>
                                        <p>{address.phone}</p>
                                        <p className="mt-1">
                                            {[address.address_line_1, address.address_line_2, address.landmark]
                                                .filter(Boolean)
                                                .join(', ')}
                                        </p>
                                        <p>
                                            {address.city}, {address.state} - {address.pincode}
                                        </p>
                                    </div>
                                </section>
                            ) : (
                                <section className="border border-amber-200 bg-amber-50 p-6">
                                    <p className="text-sm font-semibold text-amber-900">Delivery address required</p>
                                    <p className="mt-2 text-sm text-amber-800">
                                        Add and select an address on the cart page before placing your order.
                                    </p>
                                    <Link
                                        href="/cart"
                                        className="mt-4 inline-flex text-sm font-semibold text-[#062A4D] underline"
                                    >
                                        Go to cart
                                    </Link>
                                </section>
                            )}

                            <section className="border border-[#E8DDC5] bg-white p-6">
                                <h2 className="text-[11px] font-medium tracking-[0.18em] text-[#062A4D] uppercase">
                                    Payment Method
                                </h2>
                                <div className="mt-4 space-y-3">
                                    <label
                                        className={`flex cursor-pointer items-start gap-3 border p-4 transition ${
                                            method === 'razorpay'
                                                ? 'border-[#062A4D] bg-[#F5F1E8]'
                                                : 'border-[#E8DDC5] hover:border-[#062A4D]/40'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="razorpay"
                                            checked={method === 'razorpay'}
                                            onChange={() => setMethod('razorpay')}
                                            className="mt-1 h-4 w-4 accent-[#062A4D]"
                                        />
                                        <span className="flex flex-1 items-start gap-3">
                                            <CreditCard className="mt-0.5 h-5 w-5 text-[#062A4D]" />
                                            <span>
                                                <span className="block font-semibold text-[#09233D]">Online Payment</span>
                                                <span className="mt-1 block text-sm text-[#647487]">
                                                    Pay securely with UPI, cards, or net banking via Razorpay.
                                                </span>
                                            </span>
                                        </span>
                                    </label>

                                    {codEnabled && (
                                        <label
                                            className={`flex cursor-pointer items-start gap-3 border p-4 transition ${
                                                method === 'cod'
                                                    ? 'border-[#062A4D] bg-[#F5F1E8]'
                                                    : 'border-[#E8DDC5] hover:border-[#062A4D]/40'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="payment_method"
                                                value="cod"
                                                checked={method === 'cod'}
                                                onChange={() => setMethod('cod')}
                                                className="mt-1 h-4 w-4 accent-[#062A4D]"
                                            />
                                            <span className="flex flex-1 items-start gap-3">
                                                <Banknote className="mt-0.5 h-5 w-5 text-[#062A4D]" />
                                                <span>
                                                    <span className="block font-semibold text-[#09233D]">
                                                        Cash on Delivery
                                                    </span>
                                                    <span className="mt-1 block text-sm text-[#647487]">
                                                        Pay in cash when your order is delivered.
                                                    </span>
                                                </span>
                                            </span>
                                        </label>
                                    )}
                                </div>
                            </section>

                            <section className="border border-[#E8DDC5] bg-white p-6">
                                <div className="flex items-center gap-3">
                                    <ShoppingBag className="h-5 w-5 text-[#062A4D]" />
                                    <h2 className="text-[11px] font-medium tracking-[0.18em] text-[#062A4D] uppercase">
                                        Order Items ({cartItems.length})
                                    </h2>
                                </div>
                                <ul className="mt-4 divide-y divide-[#E8DDC5]">
                                    {cartItems.map((item) => (
                                        <li key={item.key} className="flex justify-between gap-4 py-3 text-sm">
                                            <div>
                                                <p className="font-semibold text-[#09233D]">{item.product.name}</p>
                                                <p className="text-[#647487]">{checkoutItemMeta(item)}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>

                        <div className="lg:sticky top-below-home-header lg:self-start">
                            <aside className="border border-[#E8DDC5] bg-white p-6">
                                <p className="text-[11px] font-medium tracking-[0.22em] text-[#062A4D] uppercase">Checkout</p>
                                <h2 className="mt-2 font-serif text-2xl font-medium tracking-tight text-[#09233D]">
                                    Order Summary
                                </h2>

                                <dl className="mt-5 space-y-3 text-sm">
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-[#647487]">Subtotal</dt>
                                        <dd className="font-semibold text-[#09233D]">{formatPrice(cartTotals.subtotal)}</dd>
                                    </div>
                                    {!isBuyNow && cartTotals.couponDiscount > 0 && (
                                        <div className="flex justify-between gap-4 text-emerald-700">
                                            <dt>Coupon{appliedCoupon ? ` (${appliedCoupon.code})` : ''}</dt>
                                            <dd className="font-semibold">-{formatPrice(cartTotals.couponDiscount)}</dd>
                                        </div>
                                    )}
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-[#647487]">Shipping</dt>
                                        <dd className="font-semibold text-[#09233D]">{cartTotals.shippingLabel}</dd>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-[#647487]">GST</dt>
                                        <dd className="font-semibold text-[#09233D]">{cartTotals.taxLabel}</dd>
                                    </div>
                                </dl>

                                <div className="mt-5 border-t border-[#E8DDC5] pt-5">
                                    <div className="flex justify-between gap-4">
                                        <span className="text-lg font-medium text-[#09233D]">Total</span>
                                        <span className="text-2xl font-semibold text-[#062A4D]">
                                            {formatPrice(cartTotals.grandTotal)}
                                        </span>
                                    </div>
                                    {cartTotals.totalSavings > 0 && (
                                        <p className="mt-3 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                                            You saved {formatPrice(cartTotals.totalSavings)} today
                                        </p>
                                    )}
                                </div>

                                {estimatedDeliveryDate && (
                                    <div className="mt-5 flex items-start gap-3 bg-[#F5F1E8] p-4">
                                        <Truck className="mt-0.5 h-5 w-5 shrink-0 text-[#062A4D]" />
                                        <div className="text-sm">
                                            <p className="font-semibold text-[#09233D]">Estimated Delivery</p>
                                            <p className="text-[#647487]">By {estimatedDeliveryDate}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="hidden lg:block">
                                    <button
                                        type="button"
                                        disabled={processing || !address}
                                        onClick={placeOrder}
                                        className={`mt-6 h-11 w-full text-[11px] ${checkoutActionCtaClass(method)}`}
                                    >
                                        {processing
                                            ? 'Processing...'
                                            : method === 'cod'
                                              ? 'Place Order'
                                              : 'Pay Now'}
                                    </button>
                                    <InputError
                                        message={errors?.checkout || errors?.address_id || errors?.payment_method}
                                        className="mt-3 text-center"
                                    />
                                    <p className="mt-3 text-center text-xs text-[#647487]">
                                        {method === 'cod'
                                            ? 'Your order will be placed and paid on delivery.'
                                            : 'You will be redirected to the secure Razorpay window.'}
                                    </p>
                                </div>
                            </aside>
                        </div>
                    </div>
                </main>

                <HomeFooter />

                <CheckoutMobilePayBar
                    grandTotal={cartTotals.grandTotal}
                    method={method}
                    processing={processing}
                    hasAddress={Boolean(address)}
                    onPlaceOrder={placeOrder}
                />
            </div>
        </>
    );
}

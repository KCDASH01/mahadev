import { Head, Link, router } from '@inertiajs/react';
import { AlertCircle, Banknote, RefreshCw, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { HomeBrandMotif } from '@/components/home/home-brand-motif';
import { HomeFooter } from '@/components/home/home-footer';
import { HomeHeader } from '@/components/home/home-header';
import { homeBrand } from '@/data/home-brand';
import { formatPrice } from '@/data/fashion-products';
import { checkoutCtaClass, continueShoppingCtaClass } from '@/lib/commerce-cta';
import { retry as retryCheckout } from '@/routes/checkout';
import { index as ordersIndex } from '@/routes/account/orders';

type CheckoutFailedProps = {
    order: {
        orderNumber: string;
        grandTotal: number;
        paymentStatus: string;
        orderStatus: string;
    };
    codEnabled: boolean;
    continueShoppingUrl: string;
};

export default function CheckoutFailed({ order, codEnabled, continueShoppingUrl }: CheckoutFailedProps) {
    const [retrying, setRetrying] = useState(false);
    const [switchingToCod, setSwitchingToCod] = useState(false);

    const retryPayment = () => {
        setRetrying(true);
        router.post(
            retryCheckout.url(order.orderNumber),
            {},
            {
                preserveScroll: true,
                onFinish: () => setRetrying(false),
            },
        );
    };

    const chooseCashOnDelivery = () => {
        setSwitchingToCod(true);
        router.post(
            '/checkout/abandon',
            { order_number: order.orderNumber },
            {
                preserveScroll: true,
                onFinish: () => setSwitchingToCod(false),
            },
        );
    };

    return (
        <>
            <Head title={`Payment Failed - ${homeBrand.name}`} />

            <div className="min-h-screen bg-[#FCFAF5] font-sans text-[#09233D] antialiased">
                <HomeHeader />

                <main className="mx-auto max-w-2xl px-4 py-12 pt-home-header sm:px-6 sm:py-16">
                    <div className="text-center">
                        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-rose-200 bg-rose-50 text-rose-700 sm:h-20 sm:w-20">
                            <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10" strokeWidth={1.6} />
                        </div>
                        <p className="mt-6 text-[11px] font-medium tracking-[0.28em] text-rose-700 uppercase">
                            Payment Failed
                        </p>
                        <h1 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#09233D] sm:text-4xl">
                            We couldn&apos;t process your payment
                        </h1>
                        <HomeBrandMotif className="mt-4" />
                        <p className="mt-4 text-sm leading-6 text-[#647487]">
                            Your order <span className="font-medium text-[#09233D]">{order.orderNumber}</span> is saved
                            in pending payment state. Your cart and stock are unchanged — you can retry safely.
                        </p>
                    </div>

                    <div className="mt-8 border border-[#E8DDC5] bg-white p-5 sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-[11px] font-medium tracking-[0.16em] text-[#647487] uppercase">
                                    Amount due
                                </p>
                                <p className="mt-1 text-2xl font-semibold text-[#062A4D]">
                                    {formatPrice(order.grandTotal)}
                                </p>
                            </div>
                            <div className="sm:text-right">
                                <p className="text-[11px] font-medium tracking-[0.16em] text-[#647487] uppercase">
                                    Order status
                                </p>
                                <p className="mt-1 font-medium capitalize text-amber-800">
                                    {order.orderStatus.replace(/_/g, ' ')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={retryPayment}
                            disabled={retrying || switchingToCod}
                            className={`h-11 flex-1 text-[11px] ${checkoutCtaClass}`}
                        >
                            <RefreshCw className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
                            {retrying ? 'Opening payment…' : 'Retry Payment'}
                        </button>
                        {codEnabled && (
                            <button
                                type="button"
                                onClick={chooseCashOnDelivery}
                                disabled={retrying || switchingToCod}
                                className="inline-flex h-11 flex-1 items-center justify-center gap-2 border border-[#062A4D] bg-white px-6 text-[11px] font-bold tracking-wide text-[#062A4D] uppercase transition hover:bg-[#062A4D] hover:text-[#FCFAF5] disabled:opacity-60"
                            >
                                <Banknote className={`h-4 w-4 ${switchingToCod ? 'animate-pulse' : ''}`} />
                                {switchingToCod ? 'Loading…' : 'Pay with COD'}
                            </button>
                        )}
                        <Link
                            href={continueShoppingUrl}
                            className={`h-11 flex-1 text-[11px] ${continueShoppingCtaClass}`}
                        >
                            <ShoppingBag className="h-4 w-4" />
                            Continue Shopping
                        </Link>
                    </div>

                    <p className="mt-6 text-center text-sm text-[#647487]">
                        Need help?{' '}
                        <Link href={ordersIndex.url()} className="font-semibold text-[#062A4D] hover:underline">
                            View your orders
                        </Link>
                    </p>
                </main>

                <HomeFooter />
            </div>
        </>
    );
}

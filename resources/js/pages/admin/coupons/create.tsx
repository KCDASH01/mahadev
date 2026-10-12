import { Form, Head, Link } from '@inertiajs/react';
import CouponFormFields from '@/components/admin/coupon-form';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { SelectOption } from '@/types/admin';

type CouponTypeOption = {
    value: string;
    label: string;
};

export default function CouponsCreate({
    categories,
    products,
    couponTypes,
}: {
    categories: SelectOption[];
    products: SelectOption[];
    couponTypes: CouponTypeOption[];
}) {
    return (
        <>
            <Head title="Create Coupon" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading title="Create Coupon" description="Add a new offer or coupon code" />

                <Card className="max-w-4xl">
                    <CardHeader>
                        <CardTitle>Coupon Details</CardTitle>
                        <CardDescription>
                            Category or product scope makes the coupon apply only to matching cart items.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form action="/admin/coupons" method="post" className="space-y-6">
                            {({ processing, errors }) => (
                                <>
                                    <CouponFormFields
                                        categories={categories}
                                        products={products}
                                        couponTypes={couponTypes}
                                        errors={errors}
                                        processing={processing}
                                        submitLabel="Create Coupon"
                                    />
                                    <Button variant="outline" asChild>
                                        <Link href="/admin/coupons">Cancel</Link>
                                    </Button>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

CouponsCreate.layout = {
    breadcrumbs: [
        { title: 'Coupons', href: '/admin/coupons' },
        { title: 'Create', href: '/admin/coupons/create' },
    ],
};

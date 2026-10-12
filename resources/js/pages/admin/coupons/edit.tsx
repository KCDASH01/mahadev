import { Form, Head, Link } from '@inertiajs/react';
import { adminUpdateUrl } from '@/components/admin/admin-destroy-form';
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
import type { Coupon, SelectOption } from '@/types/admin';

type CouponTypeOption = {
    value: string;
    label: string;
};

export default function CouponsEdit({
    coupon,
    categories,
    products,
    couponTypes,
}: {
    coupon: Coupon;
    categories: SelectOption[];
    products: SelectOption[];
    couponTypes: CouponTypeOption[];
}) {
    return (
        <>
            <Head title={`Edit ${coupon.code}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading title={`Edit ${coupon.code}`} description="Update coupon settings and scope" />

                <Card className="max-w-4xl">
                    <CardHeader>
                        <CardTitle>Coupon Details</CardTitle>
                        <CardDescription>Used {coupon.used_count} time{coupon.used_count === 1 ? '' : 's'} so far.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form
                            action={adminUpdateUrl('/admin/coupons', coupon.id)}
                            method="post"
                            className="space-y-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <CouponFormFields
                                        coupon={coupon}
                                        categories={categories}
                                        products={products}
                                        couponTypes={couponTypes}
                                        errors={errors}
                                        processing={processing}
                                        submitLabel="Update Coupon"
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

CouponsEdit.layout = {
    breadcrumbs: [
        { title: 'Coupons', href: '/admin/coupons' },
        { title: 'Edit', href: '/admin/coupons/edit' },
    ],
};

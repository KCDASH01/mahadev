import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { ArrowLeft, Pencil } from 'lucide-react';
import StatusBadge from '@/components/admin/status-badge';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { mediaUrl } from '@/lib/media-url';
import { edit, index } from '@/routes/admin/products';
import type { Product } from '@/types/admin';

function DetailItem({
    label,
    value,
}: {
    label: string;
    value: ReactNode;
}) {
    return (
        <div className="grid gap-1">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <div className="text-sm">{value}</div>
        </div>
    );
}

export default function ProductsShow({ product }: { product: Product }) {
    const hasVariants = (product.variants?.length ?? 0) > 0;
    const displayStock = hasVariants
        ? (product.variants_sum_stock ?? 0)
        : product.stock;

    return (
        <>
            <Head title={product.name} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between gap-4">
                    <Heading
                        title={product.name}
                        description="Product details"
                    />
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={index()}>
                                <ArrowLeft className="size-4" />
                                Back
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={edit(product.id)}>
                                <Pencil className="size-4" />
                                Edit Product
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Overview</CardTitle>
                            <CardDescription>
                                SKU: {product.sku}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <DetailItem
                                    label="Category"
                                    value={product.category?.name ?? '—'}
                                />
                                <DetailItem
                                    label="Brand"
                                    value={product.brand?.name ?? '—'}
                                />
                                <DetailItem label="Slug" value={product.slug} />
                                <DetailItem
                                    label="Status"
                                    value={
                                        <StatusBadge status={product.status} />
                                    }
                                />
                                <DetailItem
                                    label="Original price"
                                    value={`₹${product.original_price}`}
                                />
                                <DetailItem
                                    label="Sale price"
                                    value={`₹${product.sale_price}`}
                                />
                                <DetailItem
                                    label="Display rating"
                                    value={product.display_rating}
                                />
                                <DetailItem
                                    label="Display review count"
                                    value={product.display_review_count}
                                />
                                <DetailItem
                                    label="Stock"
                                    value={
                                        hasVariants
                                            ? `${displayStock} (variant total)`
                                            : displayStock
                                    }
                                />
                                <DetailItem
                                    label="Weight"
                                    value={
                                        product.weight
                                            ? `${product.weight} kg`
                                            : '—'
                                    }
                                />
                                <DetailItem
                                    label="Featured"
                                    value={
                                        product.is_featured ? (
                                            <Badge variant="secondary">
                                                Yes
                                            </Badge>
                                        ) : (
                                            'No'
                                        )
                                    }
                                />
                            </div>

                            {product.short_description && (
                                <DetailItem
                                    label="Short description"
                                    value={product.short_description}
                                />
                            )}

                            {product.description && (
                                <DetailItem
                                    label="Description"
                                    value={
                                        <p className="whitespace-pre-wrap">
                                            {product.description}
                                        </p>
                                    }
                                />
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Thumbnail</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {product.thumbnail ? (
                                <img
                                    src={mediaUrl(product.thumbnail) ?? ''}
                                    alt={product.name}
                                    className="w-full rounded-md border object-cover"
                                />
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No thumbnail
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {(product.images?.length ?? 0) > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Gallery</CardTitle>
                            <CardDescription>
                                {product.images?.length} image
                                {(product.images?.length ?? 0) === 1
                                    ? ''
                                    : 's'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                {product.images?.map((image) => (
                                    <div key={image.id} className="space-y-2">
                                        <img
                                            src={mediaUrl(image.image) ?? ''}
                                            alt={`Gallery ${image.sort_order}`}
                                            className="aspect-square w-full rounded-md border object-cover"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Order: {image.sort_order}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {hasVariants && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Variants</CardTitle>
                            <CardDescription>
                                {product.variants?.length} variant
                                {(product.variants?.length ?? 0) === 1
                                    ? ''
                                    : 's'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="w-full text-sm">
                                    <thead className="border-b bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Options
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                SKU
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Prices
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Stock
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {product.variants?.map((variant) => (
                                            <tr
                                                key={variant.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="px-4 py-3">
                                                    {variant.option_values
                                                        ?.map(
                                                            (option) =>
                                                                `${option.attribute?.name ?? 'Option'}: ${option.value}`,
                                                        )
                                                        .join(' · ') || '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {variant.sku}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-muted-foreground line-through">
                                                        ₹{variant.original_price}
                                                    </span>
                                                    <br />
                                                    <span className="font-medium">
                                                        ₹{variant.sale_price}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {variant.stock}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge
                                                        status={variant.status}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

ProductsShow.layout = {
    breadcrumbs: [
        {
            title: 'Products',
            href: index(),
        },
        {
            title: 'View',
            href: index(),
        },
    ],
};

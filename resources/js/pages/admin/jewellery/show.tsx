import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { ArrowLeft, Pencil } from 'lucide-react';
import StatusBadge from '@/components/admin/status-badge';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { mediaUrl } from '@/lib/media-url';
import type { Product } from '@/types/admin';

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="grid gap-1">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <div className="text-sm">{value}</div>
        </div>
    );
}

function jewelleryDetails(product: Product): Record<string, string> {
    const details = product.details;

    if (!details || Array.isArray(details)) {
        return {};
    }

    return details;
}

export default function JewelleryShow({ product }: { product: Product }) {
    const details = jewelleryDetails(product);

    return (
        <>
            <Head title={product.name} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between gap-4">
                    <Heading title={product.name} description="Jewellery details" />
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/admin/jewellery">
                                <ArrowLeft className="size-4" />
                                Back
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={`/admin/jewellery/${product.id}/edit`}>
                                <Pencil className="size-4" />
                                Edit Jewellery
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Overview</CardTitle>
                            <CardDescription>SKU: {product.sku}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <DetailItem label="Category" value={product.category?.name ?? '—'} />
                                <DetailItem label="Brand" value={product.brand?.name ?? '—'} />
                                <DetailItem
                                    label="Status"
                                    value={<StatusBadge status={product.status} />}
                                />
                                <DetailItem label="Stock" value={product.stock} />
                                <DetailItem label="Original price" value={`₹${product.original_price}`} />
                                <DetailItem label="Sale price" value={`₹${product.sale_price}`} />
                                <DetailItem
                                    label="Created"
                                    value={new Date(product.created_at).toLocaleDateString()}
                                />
                            </div>

                            {product.short_description && (
                                <DetailItem label="Short description" value={product.short_description} />
                            )}
                            {product.description && (
                                <DetailItem
                                    label="Description"
                                    value={<p className="whitespace-pre-wrap">{product.description}</p>}
                                />
                            )}
                            {product.care_instructions && (
                                <DetailItem
                                    label="Care instructions"
                                    value={<p className="whitespace-pre-wrap">{product.care_instructions}</p>}
                                />
                            )}
                            {Object.keys(details).length > 0 && (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {Object.entries(details).map(([key, value]) => (
                                        <DetailItem
                                            key={key}
                                            label={key.replaceAll('_', ' ')}
                                            value={value}
                                        />
                                    ))}
                                </div>
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
                                <p className="text-sm text-muted-foreground">No thumbnail</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {(product.images?.length ?? 0) > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Gallery</CardTitle>
                            <CardDescription>
                                {product.images?.length} image{(product.images?.length ?? 0) === 1 ? '' : 's'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                {product.images?.map((image) => (
                                    <img
                                        key={image.id}
                                        src={mediaUrl(image.image) ?? ''}
                                        alt={`Gallery ${image.sort_order}`}
                                        className="aspect-square w-full rounded-md border object-cover"
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

JewelleryShow.layout = {
    breadcrumbs: [
        { title: 'Jewellery', href: '/admin/jewellery' },
        { title: 'View', href: '/admin/jewellery' },
    ],
};

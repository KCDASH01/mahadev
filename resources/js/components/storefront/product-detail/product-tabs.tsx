import { useState } from 'react';
import ProductReviews from '@/components/storefront/product-detail/product-reviews';
import { themeColors } from '@/lib/theme-colors';
import type {
    ProductDetail,
    ProductReview,
    RatingSummary,
} from '@/types/product';

const tabs = ['Description', 'Specifications', 'Reviews'] as const;

export default function ProductTabs({
    product,
    reviews,
    ratingSummary,
}: {
    product: ProductDetail;
    reviews: ProductReview[];
    ratingSummary: RatingSummary;
}) {
    const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Description');

    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex overflow-x-auto border-b border-slate-200">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`shrink-0 px-4 py-3 text-sm font-semibold transition sm:px-6 sm:py-4 ${
                            activeTab === tab
                                ? 'border-b-2 text-[#2563EB]'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                        style={
                            activeTab === tab
                                ? { borderBottomColor: themeColors.primary }
                                : undefined
                        }
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="p-4 sm:p-6 md:p-8">
                {activeTab === 'Description' && (
                    <div className="prose prose-slate max-w-none">
                        <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                            {product.description}
                        </p>
                        {product.short_description && (
                            <p className="mt-4 text-sm leading-relaxed text-slate-500">
                                {product.short_description}
                            </p>
                        )}
                    </div>
                )}

                {activeTab === 'Specifications' && (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[280px] text-left text-sm">
                            <tbody>
                                {product.specifications.map((spec) => (
                                    <tr
                                        key={spec.label}
                                        className="border-b border-slate-100 last:border-0"
                                    >
                                        <th className="w-1/3 py-3 pr-4 font-semibold text-slate-800">
                                            {spec.label}
                                        </th>
                                        <td className="py-3 text-slate-600">
                                            {spec.value}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'Reviews' && (
                    <ProductReviews
                        reviews={reviews}
                        ratingSummary={ratingSummary}
                    />
                )}
            </div>
        </div>
    );
}

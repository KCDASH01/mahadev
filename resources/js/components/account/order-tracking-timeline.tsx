import { Check, Circle, ExternalLink, Package, Truck } from 'lucide-react';
import {
    buildOrderMilestones,
    currentMilestoneSummary,
    milestoneProgressPercent,
    type OrderMilestone,
    type ShipmentInfo,
    type TrackingEvent,
} from '@/lib/order-tracking-milestones';
import { cn } from '@/lib/utils';

type OrderTrackingTimelineProps = {
    trackings: TrackingEvent[];
    orderStatus: string;
    paymentMethod: string;
    paymentStatus: string;
    estimatedDeliveryDate?: string | null;
    shipment?: ShipmentInfo | null;
};

function formatDateTime(iso?: string): string {
    if (!iso) {
        return '';
    }

    return new Date(iso).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function MilestoneNode({ state }: { state: OrderMilestone['state'] }) {
    if (state === 'completed') {
        return (
            <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
                <Check className="h-4 w-4" strokeWidth={3} />
            </span>
        );
    }

    if (state === 'current') {
        return (
            <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#062A4D] bg-white shadow-sm ring-4 ring-[#062A4D]/15">
                <span className="h-2.5 w-2.5 rounded-full bg-[#062A4D]" />
            </span>
        );
    }

    if (state === 'cancelled') {
        return (
            <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Circle className="h-4 w-4" />
            </span>
        );
    }

    return (
        <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-200 bg-white">
            <span className="h-2 w-2 rounded-full bg-slate-300" />
        </span>
    );
}

function MilestoneItem({
    milestone,
    isLast,
}: {
    milestone: OrderMilestone;
    isLast: boolean;
}) {
    const isCurrent = milestone.state === 'current';
    const isCompleted = milestone.state === 'completed';
    const isCancelled = milestone.state === 'cancelled';

    return (
        <li
            className="relative flex gap-4 pb-8 last:pb-0"
            aria-current={isCurrent ? 'step' : undefined}
        >
            {!isLast && (
                <span
                    className={cn(
                        'absolute top-8 left-4 w-0.5 -translate-x-1/2',
                        isCompleted || isCurrent ? 'bg-emerald-400' : 'bg-slate-200',
                    )}
                    style={{ height: 'calc(100% - 2rem)' }}
                    aria-hidden
                />
            )}

            <div className="shrink-0">
                <MilestoneNode state={milestone.state} />
            </div>

            <div
                className={cn(
                    'min-w-0 flex-1 rounded-xl border px-4 py-3 transition',
                    isCurrent && 'border-[#062A4D]/20 bg-[#F5F1E8] shadow-sm',
                    isCompleted && 'border-emerald-100 bg-emerald-50/40',
                    isCancelled && 'border-red-100 bg-red-50/60',
                    milestone.state === 'upcoming' && 'border-transparent bg-transparent px-0 py-1',
                )}
            >
                <p
                    className={cn(
                        'text-sm font-semibold',
                        isCompleted && 'text-emerald-800',
                        isCurrent && 'text-[#062A4D]',
                        isCancelled && 'text-red-700',
                        milestone.state === 'upcoming' && 'text-slate-400',
                    )}
                >
                    {milestone.label}
                </p>
                {milestone.description && milestone.state !== 'upcoming' && (
                    <p className="mt-1 text-sm leading-6 text-slate-600">{milestone.description}</p>
                )}
                {milestone.timestamp && milestone.state !== 'upcoming' && (
                    <p className="mt-1 text-xs text-slate-400">{formatDateTime(milestone.timestamp)}</p>
                )}
            </div>
        </li>
    );
}

export function OrderTrackingTimeline({
    trackings,
    orderStatus,
    paymentMethod,
    paymentStatus,
    estimatedDeliveryDate,
    shipment,
}: OrderTrackingTimelineProps) {
    const milestones = buildOrderMilestones({
        trackings,
        orderStatus,
        paymentMethod,
        paymentStatus,
        shipment,
    });

    const progress = milestoneProgressPercent(milestones);
    const summary = currentMilestoneSummary(milestones);
    const deliveryDate = shipment?.estimatedDeliveryDate ?? estimatedDeliveryDate;

    return (
        <section className="col-span-full border border-[#E8DDC5] bg-white p-4 sm:p-6">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <Truck className="h-5 w-5 shrink-0 text-[#062A4D]" />
                        <h2 className="text-sm font-bold tracking-wide text-[#062A4D] uppercase">Order Tracking</h2>
                    </div>
                    <p className="mt-3 text-base font-semibold text-neutral-900 sm:text-lg">{summary}</p>
                    {deliveryDate && (
                        <p className="mt-1 text-sm text-slate-600">
                            Estimated delivery by <span className="font-semibold text-[#062A4D]">{deliveryDate}</span>
                        </p>
                    )}
                </div>

                {shipment?.awbNumber && (
                    <div className="w-full shrink-0 rounded-xl border border-slate-100 bg-slate-50/80 p-4 sm:max-w-sm">
                        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Shipment details</p>
                        {shipment.courierName && (
                            <p className="mt-2 text-sm font-medium text-neutral-900">{shipment.courierName}</p>
                        )}
                        <p className="mt-1 font-mono text-sm break-all text-slate-700">AWB: {shipment.awbNumber}</p>
                        {shipment.trackingUrl && (
                            <a
                                href={shipment.trackingUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-[#062A4D] px-4 py-2.5 text-[11px] font-medium tracking-[0.16em] text-[#FCFAF5] uppercase transition hover:bg-[#041F3A] sm:w-auto"
                            >
                                Track on courier site
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-4 sm:hidden">
                <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>Progress</span>
                    <span>{progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#062A4D] transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {milestones.length > 0 ? (
                <ol className="mt-6" aria-label="Order tracking progress">
                    {milestones.map((milestone, index) => (
                        <MilestoneItem
                            key={milestone.key}
                            milestone={milestone}
                            isLast={index === milestones.length - 1}
                        />
                    ))}
                </ol>
            ) : (
                <div className="mt-6 flex items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
                    <Package className="h-5 w-5 shrink-0 text-slate-400" />
                    Tracking updates will appear here once your order progresses.
                </div>
            )}
        </section>
    );
}

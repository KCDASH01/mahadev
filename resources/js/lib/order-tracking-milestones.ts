export type TrackingEvent = {
    status: string;
    remarks?: string | null;
    createdAt?: string | null;
};

export type ShipmentInfo = {
    status: string;
    courierName?: string | null;
    awbNumber?: string | null;
    trackingUrl?: string | null;
    estimatedDeliveryDate?: string | null;
};

export type MilestoneKey = 'placed' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'payment' | 'cancelled';

export type MilestoneState = 'completed' | 'current' | 'upcoming' | 'cancelled';

export type OrderMilestone = {
    key: MilestoneKey;
    label: string;
    state: MilestoneState;
    timestamp?: string;
    description?: string;
};

type BuildMilestonesInput = {
    trackings: TrackingEvent[];
    orderStatus: string;
    paymentMethod: string;
    paymentStatus: string;
    shipment?: ShipmentInfo | null;
};

const MILESTONE_DEFINITIONS: Array<{ key: MilestoneKey; label: string; defaultDescription: string }> = [
    { key: 'placed', label: 'Order placed', defaultDescription: 'Your order has been received.' },
    { key: 'confirmed', label: 'Order confirmed', defaultDescription: "We've received your order." },
    { key: 'processing', label: 'Packed & handed to courier', defaultDescription: 'Seller is packing your items.' },
    { key: 'shipped', label: 'Shipped / In transit', defaultDescription: 'Package is on the way.' },
    { key: 'delivered', label: 'Delivered', defaultDescription: 'Package delivered successfully.' },
];

const PAYMENT_MILESTONE = {
    key: 'payment' as const,
    label: 'Payment',
    defaultDescriptionPending: 'Pay when your order arrives.',
    defaultDescriptionPaid: 'Payment collected successfully.',
};

const STATUS_TO_MILESTONE: Record<string, MilestoneKey> = {
    order_placed: 'placed',
    pending: 'placed',
    pending_payment: 'placed',
    confirmed: 'confirmed',
    processing: 'processing',
    shipment_created: 'processing',
    pickup: 'processing',
    shipped: 'shipped',
    in_transit: 'shipped',
    transit: 'shipped',
    out_for_delivery: 'shipped',
    delivered: 'delivered',
    payment_collected: 'payment',
    payment_successful: 'confirmed',
    cancelled: 'cancelled',
    shipment_cancelled: 'cancelled',
};

const MILESTONE_ORDER: MilestoneKey[] = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'payment'];

function normalizeStatus(status: string): string {
    return status.toLowerCase().replace(/[\s-]+/g, '_');
}

function mapStatusToMilestone(status: string): MilestoneKey | null {
    const normalized = normalizeStatus(status);

    if (STATUS_TO_MILESTONE[normalized]) {
        return STATUS_TO_MILESTONE[normalized];
    }

    if (normalized.includes('deliver')) {
        return 'delivered';
    }

    if (normalized.includes('ship') || normalized.includes('transit')) {
        return 'shipped';
    }

    if (normalized.includes('process') || normalized.includes('pack') || normalized.includes('pickup')) {
        return 'processing';
    }

    if (normalized.includes('confirm')) {
        return 'confirmed';
    }

    if (normalized.includes('cancel')) {
        return 'cancelled';
    }

    if (normalized.includes('payment')) {
        return 'payment';
    }

    return null;
}

function deriveCurrentMilestoneKey(input: BuildMilestonesInput): MilestoneKey {
    if (input.orderStatus === 'cancelled') {
        return 'cancelled';
    }

    if (input.orderStatus === 'delivered') {
        return input.paymentMethod === 'cod' && input.paymentStatus !== 'paid' ? 'payment' : 'delivered';
    }

    if (input.orderStatus === 'shipped') {
        return 'shipped';
    }

    if (input.orderStatus === 'processing') {
        return 'processing';
    }

    if (input.orderStatus === 'confirmed') {
        return 'processing';
    }

    if (input.orderStatus === 'pending' || input.orderStatus === 'pending_payment') {
        return 'confirmed';
    }

    if (input.shipment?.awbNumber) {
        const shipmentStatus = normalizeStatus(input.shipment.status);

        if (shipmentStatus.includes('deliver')) {
            return input.paymentMethod === 'cod' && input.paymentStatus !== 'paid' ? 'payment' : 'delivered';
        }

        if (shipmentStatus.includes('ship') || shipmentStatus.includes('transit')) {
            return 'shipped';
        }

        return 'processing';
    }

    return mapStatusToMilestone(input.orderStatus) ?? 'placed';
}

function milestoneIndex(key: MilestoneKey): number {
    return MILESTONE_ORDER.indexOf(key);
}

function attachTrackingData(
    milestones: OrderMilestone[],
    trackings: TrackingEvent[],
): OrderMilestone[] {
    const sorted = [...trackings].sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return aTime - bTime;
    });

    const byKey = new Map(milestones.map((m) => [m.key, { ...m }]));

    for (const event of sorted) {
        const key = mapStatusToMilestone(event.status);

        if (!key || key === 'cancelled' || !byKey.has(key)) {
            continue;
        }

        const milestone = byKey.get(key)!;
        milestone.timestamp = event.createdAt ?? milestone.timestamp;

        if (event.remarks) {
            milestone.description = event.remarks;
        }
    }

    return milestones.map((m) => byKey.get(m.key) ?? m);
}

export function buildOrderMilestones(input: BuildMilestonesInput): OrderMilestone[] {
    if (input.orderStatus === 'cancelled') {
        const cancelledEvent = [...input.trackings]
            .reverse()
            .find((event) => mapStatusToMilestone(event.status) === 'cancelled');

        return [
            {
                key: 'cancelled',
                label: 'Order cancelled',
                state: 'cancelled',
                timestamp: cancelledEvent?.createdAt ?? undefined,
                description: cancelledEvent?.remarks ?? 'This order was cancelled.',
            },
        ];
    }

    const keys: MilestoneKey[] = [...MILESTONE_DEFINITIONS.map((m) => m.key)];

    if (input.paymentMethod === 'cod') {
        keys.push('payment');
    }

    const currentKey = deriveCurrentMilestoneKey(input);
    const currentIndex = milestoneIndex(currentKey);

    let milestones: OrderMilestone[] = keys.map((key, index) => {
        if (key === 'payment') {
            const isPaid = input.paymentStatus === 'paid';

            return {
                key,
                label: PAYMENT_MILESTONE.label,
                state:
                    isPaid
                        ? 'completed'
                        : currentKey === 'payment'
                          ? 'current'
                          : currentIndex > milestoneIndex('payment')
                            ? 'completed'
                            : 'upcoming',
                description: isPaid
                    ? PAYMENT_MILESTONE.defaultDescriptionPaid
                    : PAYMENT_MILESTONE.defaultDescriptionPending,
            };
        }

        const definition = MILESTONE_DEFINITIONS.find((m) => m.key === key)!;
        let state: MilestoneState = 'upcoming';

        if (currentIndex === -1) {
            state = index === 0 ? 'current' : 'upcoming';
        } else if (index < currentIndex) {
            state = 'completed';
        } else if (index === currentIndex) {
            state = 'current';
        }

        return {
            key,
            label: definition.label,
            state,
            description: definition.defaultDescription,
        };
    });

    milestones = attachTrackingData(milestones, input.trackings);

    if (input.paymentMethod === 'cod') {
        const paymentMilestone = milestones.find((m) => m.key === 'payment');

        if (paymentMilestone && input.paymentStatus === 'paid') {
            paymentMilestone.state = 'completed';
            paymentMilestone.description = PAYMENT_MILESTONE.defaultDescriptionPaid;
        }
    }

    return milestones;
}

export function milestoneProgressPercent(milestones: OrderMilestone[]): number {
    if (milestones.length === 0) {
        return 0;
    }

    if (milestones.some((m) => m.key === 'cancelled')) {
        return 0;
    }

    const completed = milestones.filter((m) => m.state === 'completed').length;
    const current = milestones.some((m) => m.state === 'current') ? 0.5 : 0;

    return Math.round(((completed + current) / milestones.length) * 100);
}

export function currentMilestoneSummary(milestones: OrderMilestone[]): string {
    const current = milestones.find((m) => m.state === 'current');

    if (!current) {
        const lastCompleted = [...milestones].reverse().find((m) => m.state === 'completed');
        return lastCompleted?.description ?? 'Tracking updates will appear here.';
    }

    return current.description ?? current.label;
}

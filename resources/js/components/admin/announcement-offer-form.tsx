import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { AnnouncementOffer } from '@/types/admin';

type Props = {
    errors: Record<string, string>;
    processing: boolean;
    submitLabel: string;
    defaults?: Partial<AnnouncementOffer>;
};

export default function AnnouncementOfferFormFields({
    errors,
    processing,
    submitLabel,
    defaults,
}: Props) {
    return (
        <>
            <div className="space-y-2">
                <Label htmlFor="text">Offer Text *</Label>
                <Input
                    id="text"
                    name="text"
                    defaultValue={defaults?.text ?? ''}
                    placeholder="e.g. Flat 40% OFF on Men's Collection"
                    required
                />
                {errors.text && (
                    <p className="text-sm text-destructive">{errors.text}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="highlight">Highlight Text</Label>
                <Input
                    id="highlight"
                    name="highlight"
                    defaultValue={defaults?.highlight ?? ''}
                    placeholder="e.g. 40% OFF (this part will be highlighted in the announcement)"
                />
                {errors.highlight && (
                    <p className="text-sm text-destructive">
                        {errors.highlight}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="sort_order">Sort Order</Label>
                    <Input
                        id="sort_order"
                        name="sort_order"
                        type="number"
                        defaultValue={defaults?.sort_order ?? 0}
                        min={0}
                    />
                    {errors.sort_order && (
                        <p className="text-sm text-destructive">
                            {errors.sort_order}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        name="status"
                        defaultValue={defaults?.status ?? 'active'}
                    >
                        <SelectTrigger id="status">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.status && (
                        <p className="text-sm text-destructive">
                            {errors.status}
                        </p>
                    )}
                </div>
            </div>

            <Button type="submit" disabled={processing}>
                {processing ? 'Saving…' : submitLabel}
            </Button>
        </>
    );
}

import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ColorPickerFieldProps = {
    id: string;
    name: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
};

export default function ColorPickerField({
    id,
    name,
    label,
    value,
    onChange,
    error,
}: ColorPickerFieldProps) {
    const handleChange = (nextValue: string) => {
        onChange(nextValue.toUpperCase());
    };

    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <div className="flex items-center gap-3">
                <input
                    type="color"
                    value={value}
                    onChange={(event) => handleChange(event.target.value)}
                    className="size-10 cursor-pointer rounded-md border bg-transparent p-1"
                    aria-label={`${label} picker`}
                />
                <Input
                    id={id}
                    name={name}
                    value={value}
                    onChange={(event) => handleChange(event.target.value)}
                    pattern="^#([A-Fa-f0-9]{6})$"
                    required
                    className="max-w-[140px] font-mono uppercase"
                />
            </div>
            <InputError message={error} />
        </div>
    );
}

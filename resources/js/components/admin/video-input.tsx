import { Link2, Upload } from 'lucide-react';
import { useMemo, useState, type ChangeEvent } from 'react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { mediaUrl } from '@/lib/media-url';

type VideoInputProps = {
    label: string;
    urlFieldName: string;
    fileFieldName: string;
    currentValue?: string | null;
    errors?: Record<string, string>;
    urlPlaceholder?: string;
    maxSizeMb?: number;
    helperText?: string;
    hidePreview?: boolean;
    accept?: string;
    onPreviewChange?: (url: string | null) => void;
};

export default function VideoInput({
    label,
    urlFieldName,
    fileFieldName,
    currentValue,
    errors,
    urlPlaceholder = 'https://example.com/lookbook.mp4',
    maxSizeMb = 50,
    helperText,
    hidePreview = false,
    accept = 'video/mp4,video/webm,video/quicktime',
    onPreviewChange,
}: VideoInputProps) {
    const initialMode = useMemo<'upload' | 'url'>(() => {
        if (!currentValue) {
            return 'upload';
        }

        return currentValue.startsWith('http://') || currentValue.startsWith('https://')
            ? 'url'
            : 'upload';
    }, [currentValue]);

    const [mode, setMode] = useState<'upload' | 'url'>(initialMode);
    const [preview, setPreview] = useState<string | null>(mediaUrl(currentValue));
    const [localError, setLocalError] = useState<string | null>(null);
    const maxBytes = maxSizeMb * 1024 * 1024;

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            setLocalError(null);
            const fallback = mediaUrl(currentValue);
            setPreview(fallback);
            onPreviewChange?.(fallback);

            return;
        }

        if (file.size > maxBytes) {
            setLocalError(
                `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum size is ${maxSizeMb} MB.`,
            );
            event.target.value = '';
            const fallback = mediaUrl(currentValue);
            setPreview(fallback);
            onPreviewChange?.(fallback);

            return;
        }

        setLocalError(null);
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        onPreviewChange?.(objectUrl);
    };

    return (
        <div className="grid gap-3">
            <div className="flex items-center justify-between gap-4">
                <Label>{label}</Label>
                <ToggleGroup
                    type="single"
                    value={mode}
                    onValueChange={(value) => {
                        if (value) {
                            setMode(value as 'upload' | 'url');
                        }
                    }}
                    variant="outline"
                    size="sm"
                >
                    <ToggleGroupItem value="upload" aria-label="Upload file">
                        <Upload className="size-3.5" />
                        Upload
                    </ToggleGroupItem>
                    <ToggleGroupItem value="url" aria-label="Video URL">
                        <Link2 className="size-3.5" />
                        URL
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            {preview && !hidePreview && (
                <video
                    src={preview}
                    controls
                    muted
                    playsInline
                    className="max-h-40 w-full max-w-sm rounded-md border bg-black object-contain"
                />
            )}

            {mode === 'upload' ? (
                <div className="grid gap-2">
                    <input type="hidden" name={urlFieldName} value={currentValue ?? ''} />
                    <Input
                        id={fileFieldName}
                        name={fileFieldName}
                        type="file"
                        accept={accept}
                        onChange={handleFileChange}
                    />
                    <p className="text-xs text-muted-foreground">
                        {helperText ??
                            `MP4, WebM, or MOV up to ${maxSizeMb}MB. Recommended: landscape 16:9, under 30 seconds for fast loading.`}
                    </p>
                    <InputError message={localError ?? errors?.[fileFieldName]} />
                </div>
            ) : (
                <div className="grid gap-2">
                    <Input
                        id={urlFieldName}
                        name={urlFieldName}
                        type="url"
                        defaultValue={
                            currentValue?.startsWith('http') ? currentValue : ''
                        }
                        placeholder={urlPlaceholder}
                        onChange={(event) => {
                            const value = event.target.value.trim();
                            const nextPreview = value || mediaUrl(currentValue);
                            setPreview(nextPreview);
                            onPreviewChange?.(nextPreview);
                        }}
                    />
                    <p className="text-xs text-muted-foreground">
                        {helperText ??
                            'MP4, WebM, or MOV URL. When set, the video autoplays muted in the background. Poster image is used as fallback and while loading.'}
                    </p>
                    <InputError message={errors?.[urlFieldName]} />
                </div>
            )}
        </div>
    );
}

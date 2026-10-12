import { CheckCircle2, Link2, Loader2, Sparkles, Upload } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    compressImage,
    formatFileSize,
    validateImageFile,
    type CompressionResult,
} from '@/lib/image-compression';
import { mediaUrl } from '@/lib/media-url';

type MediaInputProps = {
    label: string;
    urlFieldName: string;
    fileFieldName: string;
    currentValue?: string | null;
    errors?: Record<string, string>;
    urlPlaceholder?: string;
    maxSizeMb?: number;
    helperText?: string;
    /** Pre-selected file (already compressed). Attaches to the file input on mount. */
    initialFile?: File;
};

export default function MediaInput({
    label,
    urlFieldName,
    fileFieldName,
    currentValue,
    errors,
    urlPlaceholder = 'https://example.com/image.jpg',
    maxSizeMb = 10,
    helperText,
    initialFile,
}: MediaInputProps) {
    const initialMode = useMemo<'upload' | 'url'>(() => {
        if (initialFile) {
            return 'upload';
        }

        if (!currentValue) {
            return 'upload';
        }

        return currentValue.startsWith('http://') ||
            currentValue.startsWith('https://')
            ? 'url'
            : 'upload';
    }, [currentValue, initialFile]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [mode, setMode] = useState<'upload' | 'url'>(initialMode);
    const [preview, setPreview] = useState<string | null>(
        initialFile ? URL.createObjectURL(initialFile) : mediaUrl(currentValue),
    );
    const [localError, setLocalError] = useState<string | null>(null);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizationResult, setOptimizationResult] = useState<CompressionResult | null>(null);

    useEffect(() => {
        if (initialFile && fileInputRef.current && typeof DataTransfer !== 'undefined') {
            const dt = new DataTransfer();
            dt.items.add(initialFile);
            fileInputRef.current.files = dt.files;
        }
    }, [initialFile]);

    const defaultHelper = `JPG, PNG, GIF, or WebP • Max ${maxSizeMb}MB • Images are automatically optimized before upload`;

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            setLocalError(null);
            setOptimizationResult(null);
            setPreview(mediaUrl(currentValue));
            return;
        }

        // 1. Initial Validation
        const validation = validateImageFile(file, maxSizeMb);
        if (!validation.valid) {
            setLocalError(validation.error ?? 'Invalid file.');
            setOptimizationResult(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            setPreview(mediaUrl(currentValue));
            return;
        }

        setLocalError(null);
        setIsOptimizing(true);

        try {
            // 2. Perform client-side compression
            const result = await compressImage(file, {
                maxInitialSizeMb: maxSizeMb,
                maxWidth: 2000,
                maxHeight: 2000,
                targetQuality: 0.85,
            });

            // 3. Attach compressed File back to the native file input via DataTransfer
            if (fileInputRef.current && typeof DataTransfer !== 'undefined') {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(result.file);
                fileInputRef.current.files = dataTransfer.files;
            }

            // 4. Update preview and optimization details
            setPreview(URL.createObjectURL(result.file));
            setOptimizationResult(result);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Image optimization failed.';

            // If compression fails but file is <= maxSizeMb, gracefully use original file
            if (file.size <= maxSizeMb * 1024 * 1024) {
                setLocalError(null);
                setPreview(URL.createObjectURL(file));
                setOptimizationResult(null);
            } else {
                setLocalError(message);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                setPreview(mediaUrl(currentValue));
                setOptimizationResult(null);
            }
        } finally {
            setIsOptimizing(false);
        }
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
                    <ToggleGroupItem value="url" aria-label="Image URL">
                        <Link2 className="size-3.5" />
                        URL
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            {preview && (
                <div className="relative inline-block w-fit">
                    <img
                        src={preview}
                        alt={`${label} preview`}
                        className="h-24 w-24 rounded-md border object-cover shadow-xs"
                    />
                    {isOptimizing && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40 backdrop-blur-xs">
                            <Loader2 className="size-5 animate-spin text-white" />
                        </div>
                    )}
                </div>
            )}

            {mode === 'upload' ? (
                <div className="grid gap-2">
                    <input
                        type="hidden"
                        name={urlFieldName}
                        value={currentValue ?? ''}
                    />
                    <div className="relative">
                        <Input
                            ref={fileInputRef}
                            id={fileFieldName}
                            name={fileFieldName}
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleFileChange}
                            disabled={isOptimizing}
                        />
                        {isOptimizing && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Loader2 className="size-3.5 animate-spin" />
                                <span>Optimizing...</span>
                            </div>
                        )}
                    </div>

                    {optimizationResult && optimizationResult.savedBytes > 0 && (
                        <div className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                            <Sparkles className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <span>
                                Original:{' '}
                                <strong className="font-semibold">
                                    {formatFileSize(optimizationResult.originalSize)}
                                </strong>{' '}
                                → Optimized:{' '}
                                <strong className="font-semibold">
                                    {formatFileSize(optimizationResult.compressedSize)}
                                </strong>{' '}
                                ({optimizationResult.compressionRatio}% smaller)
                            </span>
                        </div>
                    )}

                    {optimizationResult && optimizationResult.savedBytes === 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <CheckCircle2 className="size-3.5 text-emerald-600" />
                            <span>
                                Size: {formatFileSize(optimizationResult.compressedSize)} (already optimized)
                            </span>
                        </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                        {helperText ?? defaultHelper}
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
                    />
                    <InputError message={errors?.[urlFieldName]} />
                </div>
            )}
        </div>
    );
}

/**
 * Client-Side Image Compression & Validation Utility
 *
 * Automatically resizes and compresses user-selected images in the browser
 * before submission to reduce upload payloads and server memory usage.
 */

export type CompressionOptions = {
    maxWidth?: number;
    maxHeight?: number;
    maxInitialSizeMb?: number;
    targetQuality?: number;
    preferredMimeType?: 'image/webp' | 'image/jpeg' | 'image/png';
};

export type CompressionResult = {
    file: File;
    originalSize: number;
    compressedSize: number;
    savedBytes: number;
    compressionRatio: number; // percentage saved (e.g. 85.5)
    dimensions: {
        originalWidth: number;
        originalHeight: number;
        width: number;
        height: number;
    };
    format: string;
};

const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
];

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
    maxWidth: 2000,
    maxHeight: 2000,
    maxInitialSizeMb: 10,
    targetQuality: 0.85,
    preferredMimeType: 'image/webp',
};

/**
 * Format bytes into human readable string (e.g. 520 KB, 4.2 MB)
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formatted = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
    return `${formatted} ${sizes[i]}`;
}

/**
 * Validate an image file before compression
 */
export function validateImageFile(
    file: File,
    maxInitialSizeMb = DEFAULT_OPTIONS.maxInitialSizeMb,
): { valid: boolean; error?: string } {
    const fileType = file.type.toLowerCase();

    if (!ALLOWED_IMAGE_TYPES.includes(fileType)) {
        return {
            valid: false,
            error: 'Unsupported file type. Please select a JPG, PNG, GIF, or WebP image.',
        };
    }

    const maxBytes = maxInitialSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
        return {
            valid: false,
            error: `File is too large (${formatFileSize(file.size)}). Maximum allowed size before optimization is ${maxInitialSizeMb} MB.`,
        };
    }

    return { valid: true };
}

/**
 * Calculates new dimensions while maintaining aspect ratio
 */
function calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number,
): { width: number; height: number } {
    let width = originalWidth;
    let height = originalHeight;

    if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.max(1, Math.round(width * ratio));
        height = Math.max(1, Math.round(height * ratio));
    }

    return { width, height };
}

/**
 * Loads an image file into an HTMLImageElement
 */
function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(img);
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Failed to decode image. The file may be corrupt.'));
        };

        img.src = objectUrl;
    });
}

/**
 * Checks whether canvas supports WebP export
 */
function isWebpSupported(): boolean {
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').startsWith('data:image/webp');
    } catch {
        return false;
    }
}

/**
 * Compresses and optimizes an image file in the browser.
 *
 * - Resizes images exceeding max dimensions while preserving aspect ratio.
 * - Converts to high-efficiency WebP where supported, preserving transparency.
 * - Skips conversion if original is already smaller and optimized.
 */
export async function compressImage(
    file: File,
    options?: CompressionOptions,
): Promise<CompressionResult> {
    const opts: Required<CompressionOptions> = {
        ...DEFAULT_OPTIONS,
        ...options,
    };

    // 1. Initial Validation
    const validation = validateImageFile(file, opts.maxInitialSizeMb);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    const originalSize = file.size;

    // 2. Preserve animated GIFs as-is
    if (file.type === 'image/gif') {
        return {
            file,
            originalSize,
            compressedSize: originalSize,
            savedBytes: 0,
            compressionRatio: 0,
            dimensions: {
                originalWidth: 0,
                originalHeight: 0,
                width: 0,
                height: 0,
            },
            format: 'gif',
        };
    }

    // 3. Load image
    const img = await loadImage(file);
    const originalWidth = img.naturalWidth || img.width;
    const originalHeight = img.naturalHeight || img.height;

    // 4. Calculate target dimensions
    const { width, height } = calculateDimensions(
        originalWidth,
        originalHeight,
        opts.maxWidth,
        opts.maxHeight,
    );

    // If image is already smaller than 300KB and within max dimensions, keep original
    if (
        originalSize <= 300 * 1024 &&
        originalWidth <= opts.maxWidth &&
        originalHeight <= opts.maxHeight
    ) {
        return {
            file,
            originalSize,
            compressedSize: originalSize,
            savedBytes: 0,
            compressionRatio: 0,
            dimensions: {
                originalWidth,
                originalHeight,
                width,
                height,
            },
            format: file.type.replace('image/', ''),
        };
    }

    // 5. Draw on Canvas with high-quality smoothing
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
        throw new Error('Unable to create canvas context for image compression.');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    // 6. Select output format & encode
    const webpAvailable = isWebpSupported();
    let outputMimeType = opts.preferredMimeType;

    if (outputMimeType === 'image/webp' && !webpAvailable) {
        outputMimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    }

    const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, outputMimeType, opts.targetQuality);
    });

    if (!blob) {
        throw new Error('Image compression failed during blob generation.');
    }

    // 7. If compressed blob is unexpectedly larger than original, keep original
    if (blob.size >= originalSize && originalWidth <= opts.maxWidth && originalHeight <= opts.maxHeight) {
        return {
            file,
            originalSize,
            compressedSize: originalSize,
            savedBytes: 0,
            compressionRatio: 0,
            dimensions: {
                originalWidth,
                originalHeight,
                width: originalWidth,
                height: originalHeight,
            },
            format: file.type.replace('image/', ''),
        };
    }

    // 8. Create compressed File with appropriate extension
    const extension = outputMimeType === 'image/webp'
        ? 'webp'
        : outputMimeType === 'image/png'
        ? 'png'
        : 'jpg';

    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const newFileName = `${baseName}.${extension}`;

    const compressedFile = new File([blob], newFileName, {
        type: outputMimeType,
        lastModified: Date.now(),
    });

    const compressedSize = compressedFile.size;
    const savedBytes = Math.max(0, originalSize - compressedSize);
    const compressionRatio = originalSize > 0
        ? parseFloat(((savedBytes / originalSize) * 100).toFixed(1))
        : 0;

    return {
        file: compressedFile,
        originalSize,
        compressedSize,
        savedBytes,
        compressionRatio,
        dimensions: {
            originalWidth,
            originalHeight,
            width,
            height,
        },
        format: extension,
    };
}

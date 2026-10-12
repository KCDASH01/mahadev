export function displaySizeLabel(size: string | null | undefined): string {
    const trimmed = (size ?? '').trim();
    const normalized = trimmed.toLowerCase().replace(/[_-]+/g, ' ');

    if (normalized === 'free size' || normalized === 'freesize' || normalized === 'f') {
        return 'F';
    }

    return trimmed;
}

export function displayVariantLabel(label: string | null | undefined): string {
    if (!label) {
        return '';
    }

    return label.replace(/\bfree[\s_-]*size\b/gi, 'F');
}

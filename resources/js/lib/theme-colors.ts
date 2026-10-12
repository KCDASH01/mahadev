export const themeColors = {
    primary: 'var(--theme-primary, #2563EB)',
    secondary: 'var(--theme-secondary, #0F172A)',
    button: 'var(--theme-button, #2563EB)',
    header: 'var(--theme-header, #FFFFFF)',
    footer: 'var(--theme-footer, #111827)',
} as const;

export function contrastingTextColor(hex: string): string {
    const normalized = hex.replace('#', '');

    if (normalized.length !== 6) {
        return '#FFFFFF';
    }

    const r = Number.parseInt(normalized.slice(0, 2), 16);
    const g = Number.parseInt(normalized.slice(2, 4), 16);
    const b = Number.parseInt(normalized.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.6 ? '#111827' : '#FFFFFF';
}

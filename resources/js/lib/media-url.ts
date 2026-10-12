export function mediaUrl(path: string | null | undefined): string | null {
    if (typeof path !== 'string' || !path.trim()) {
        return null;
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    const normalized = path.replace(/^\/+/, '').replace(/^storage\//, '');

    return `/storage/${normalized}`;
}

function isLocalHost(host: string): boolean {
    return /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host);
}

function configuredOrigin(appUrl?: string | null): string | null {
    const raw = (appUrl ?? '').trim().replace(/\/$/, '');

    if (!raw) {
        return null;
    }

    try {
        const parsed = new URL(raw.includes('://') ? raw : `https://${raw}`);

        if (!isLocalHost(parsed.host) && parsed.protocol === 'http:') {
            parsed.protocol = 'https:';
        }

        return parsed.origin;
    } catch {
        return null;
    }
}

/**
 * Public product URL for sharing. Localhost is not treated as a link by WhatsApp,
 * so when APP_URL is a public host we share that instead of the current origin.
 */
export function productShareUrl(appUrl?: string | null): string {
    const path = `${window.location.pathname}${window.location.search}`;
    const origin = configuredOrigin(appUrl);

    if (origin && isLocalHost(window.location.host) && !isLocalHost(new URL(origin).host)) {
        return `${origin}${path}`;
    }

    return `${window.location.origin}${path}`;
}

export function absoluteAssetUrl(path: string | null | undefined, appUrl?: string | null): string | null {
    if (!path) {
        return null;
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    const origin = configuredOrigin(appUrl) ?? (typeof window === 'undefined' ? null : window.location.origin);

    if (!origin) {
        return path;
    }

    return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}

export function whatsappShareHref(text: string, url: string): string {
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n\n${url}`)}`;
}

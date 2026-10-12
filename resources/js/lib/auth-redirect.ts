export function authUrlWithRedirect(path: '/login' | '/register', returnUrl: string): string {
    return `${path}?redirect=${encodeURIComponent(returnUrl)}`;
}

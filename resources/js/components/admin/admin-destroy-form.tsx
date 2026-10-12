import { Form } from '@inertiajs/react';
import type { ReactNode } from 'react';

type AdminDestroyFormProps = {
    action: string;
    children: (props: { processing: boolean }) => ReactNode;
};

/** Build POST delete URL for admin resources, e.g. `/admin/brands/5/delete`. */
export function adminDeleteUrl(resource: string, id: number | string): string {
    return `${resource.replace(/\/$/, '')}/${id}/delete`;
}

/** Build POST update URL for admin resources, e.g. `/admin/brands/5/update`. */
export function adminUpdateUrl(resource: string, id: number | string): string {
    return `${resource.replace(/\/$/, '')}/${id}/update`;
}

/** Build POST update URL for singleton admin pages, e.g. `/admin/settings/general/update`. */
export function adminSingletonUpdateUrl(path: string): string {
    return `${path.replace(/\/$/, '')}/update`;
}

/**
 * Shared-hosting-safe delete form.
 * Uses a dedicated POST `/delete` route (no HTTP DELETE or `_method` spoofing),
 * which avoids Apache/ModSecurity 403 blocks on cPanel hosting.
 */
export function AdminDestroyForm({ action, children }: AdminDestroyFormProps) {
    return (
        <Form action={action} method="post">
            {({ processing }) => children({ processing })}
        </Form>
    );
}

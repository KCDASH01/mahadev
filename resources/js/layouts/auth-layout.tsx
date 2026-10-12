import StorefrontAuthLayout from '@/layouts/auth/storefront-auth-layout';

export default function AuthLayout({
    title = '',
    description = '',
    children,
}: {
    title?: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <StorefrontAuthLayout title={title} description={description}>
            {children}
        </StorefrontAuthLayout>
    );
}

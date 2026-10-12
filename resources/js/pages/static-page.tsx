import { staticPages } from '@/data/static-pages';
import {
    StaticPageContentBlock,
    StaticPageShell,
    staticPageBreadcrumb,
} from '@/components/storefront/static-page-shell';

export default function StaticPage({ pageKey }: { pageKey: string }) {
    const page = staticPages[pageKey];

    if (!page) {
        return null;
    }

    return (
        <StaticPageShell
            title={page.title}
            subtitle={page.subtitle}
            breadcrumbs={staticPageBreadcrumb(page.title)}
        >
            {page.sections.map((section, index) => (
                <StaticPageContentBlock
                    key={`${pageKey}-${index}`}
                    heading={section.heading}
                    paragraphs={section.paragraphs}
                    bullets={section.bullets}
                />
            ))}
        </StaticPageShell>
    );
}

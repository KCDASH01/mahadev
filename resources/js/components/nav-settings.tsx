import { Link } from '@inertiajs/react';
import { ChevronRight, Settings } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { edit as generalEdit } from '@/routes/admin/settings/general';
import { edit as socialEdit } from '@/routes/admin/settings/social-media';
import { edit as themeEdit } from '@/routes/admin/settings/theme';

const settingsItems = [
    { title: 'General Settings', href: generalEdit() },
    { title: 'Theme Settings', href: themeEdit() },
    { title: 'Social Media Settings', href: socialEdit() },
];

export function NavSettings() {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const closeMobileNav = useMobileNavigation();
    const isSettingsActive = settingsItems.some((item) =>
        isCurrentOrParentUrl(item.href),
    );

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarMenu>
                <Collapsible
                    asChild
                    defaultOpen={isSettingsActive}
                    className="group/collapsible"
                >
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={{ children: 'Settings' }}>
                                <Settings />
                                <span>Settings</span>
                                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {settingsItems.map((item) => (
                                    <SidebarMenuSubItem key={item.title}>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={isCurrentOrParentUrl(
                                                item.href,
                                            )}
                                        >
                                            <Link href={item.href} prefetch onClick={closeMobileNav}>
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            </SidebarMenu>
        </SidebarGroup>
    );
}

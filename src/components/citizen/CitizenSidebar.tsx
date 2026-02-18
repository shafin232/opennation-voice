import {
  Newspaper, FileText, Building2, Landmark, FileSearch, Hospital, Wrench,
  BarChart3, Bell, User, Settings
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from '@/components/ui/sidebar';

export function CitizenSidebar() {
  const { t } = useLanguage();

  const items = [
    { title: t('feed'), url: '/app', icon: Newspaper },
    { title: t('submitReport'), url: '/app/submit-report', icon: FileText },
    { title: t('projects'), url: '/app/projects', icon: Building2 },
    { title: t('rti'), url: '/app/rti', icon: FileSearch },
    { title: t('hospitals'), url: '/app/hospitals', icon: Hospital },
    { title: t('communityRepair'), url: '/app/community-repair', icon: Wrench },
    { title: t('integrity'), url: '/app/integrity', icon: BarChart3 },
    { title: t('notifications'), url: '/app/notifications', icon: Bell },
    { title: t('profile'), url: '/app/profile', icon: User },
    { title: t('settings'), url: '/app/settings', icon: Settings },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('appName')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === '/app'} className="hover:bg-muted/50" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

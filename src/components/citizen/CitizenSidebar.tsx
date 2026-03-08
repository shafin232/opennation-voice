import {
  Newspaper, FileText, Building2, FileSearch, Hospital, Wrench,
  BarChart3, Bell, User, Settings, Shield
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';

export function CitizenSidebar() {
  const { t } = useLanguage();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

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
    <Sidebar collapsible="icon" className="border-r border-[hsl(var(--border-subtle))] glass-nav">
      <SidebarHeader className="p-4">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bengali font-bold text-sm text-sidebar-foreground leading-none">{t('appName')}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-bengali">নাগরিক পোর্টাল</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground px-3">
            {!collapsed && 'মেনু'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/app'}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-all font-bengali"
                      activeClassName="bg-primary/10 text-primary font-semibold"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
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

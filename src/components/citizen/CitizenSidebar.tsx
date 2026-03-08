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

  const sections = [
    {
      label: 'ড্যাশবোর্ড',
      items: [
        { title: t('feed'), url: '/app', icon: Newspaper },
      ],
    },
    {
      label: 'নাগরিক কার্যক্রম',
      items: [
        { title: t('submitReport'), url: '/app/submit-report', icon: FileText },
        { title: t('communityRepair'), url: '/app/community-repair', icon: Wrench },
      ],
    },
    {
      label: 'সরকারি তথ্য',
      items: [
        { title: t('projects'), url: '/app/projects', icon: Building2 },
        { title: t('rti'), url: '/app/rti', icon: FileSearch },
        { title: t('hospitals'), url: '/app/hospitals', icon: Hospital },
        { title: t('integrity'), url: '/app/integrity', icon: BarChart3 },
      ],
    },
    {
      label: 'ব্যবহারকারী',
      items: [
        { title: t('notifications'), url: '/app/notifications', icon: Bell },
        { title: t('profile'), url: '/app/profile', icon: User },
        { title: t('settings'), url: '/app/settings', icon: Settings },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-[hsl(var(--border-subtle))] glass-sidebar">
      <SidebarHeader className="p-4 pb-3">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow-teal">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bengali font-bold text-sm text-sidebar-foreground leading-none">{t('appName')}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-bengali">Civic Intelligence</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow-teal">
              <Shield className="h-4 w-4 text-white" />
            </div>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="px-2">
        {sections.map((section, si) => (
          <SidebarGroup key={si}>
            {!collapsed && (
              <SidebarGroupLabel className="text-[9px] uppercase tracking-[0.15em] font-semibold text-muted-foreground/60 px-3 mb-1">
                {section.label}
              </SidebarGroupLabel>
            )}
            {si > 0 && collapsed && <div className="h-px bg-border/30 mx-2 my-1" />}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === '/app'}
                        className="group flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-muted/30 transition-all duration-200 font-bengali"
                        activeClassName="glow-active bg-primary/8 text-primary font-semibold"
                      >
                        <div className="h-7 w-7 rounded-lg bg-muted/40 group-hover:bg-muted/60 flex items-center justify-center transition-colors shrink-0">
                          <item.icon className="h-3.5 w-3.5" />
                        </div>
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

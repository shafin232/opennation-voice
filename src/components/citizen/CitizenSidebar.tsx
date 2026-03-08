import {
  Newspaper, FileText, Building2, FileSearch, Hospital, Wrench,
  BarChart3, Bell, User, Settings, Shield, Zap, TrendingUp
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
      label: 'DASHBOARD',
      items: [
        { title: t('feed'), url: '/app', icon: Newspaper },
      ],
    },
    {
      label: 'ACTIONS',
      items: [
        { title: t('submitReport'), url: '/app/submit-report', icon: FileText },
        { title: t('communityRepair'), url: '/app/community-repair', icon: Wrench },
      ],
    },
    {
      label: 'EXPLORE',
      items: [
        { title: t('projects'), url: '/app/projects', icon: Building2 },
        { title: t('rti'), url: '/app/rti', icon: FileSearch },
        { title: t('tenderAnalysis'), url: '/app/tenders', icon: TrendingUp },
        { title: t('hospitals'), url: '/app/hospitals', icon: Hospital },
        { title: t('integrity'), url: '/app/integrity', icon: BarChart3 },
      ],
    },
    {
      label: 'ACCOUNT',
      items: [
        { title: t('notifications'), url: '/app/notifications', icon: Bell },
        { title: t('profile'), url: '/app/profile', icon: User },
        { title: t('settings'), url: '/app/settings', icon: Settings },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-border/30 glass-sidebar">
      <SidebarHeader className="p-4 pb-3">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="OpenNation" className="h-16 object-contain" />
          </div>
        ) : (
          <div className="flex justify-center">
            <img src={logoImg} alt="OpenNation" className="h-11 w-11 object-contain" />
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="px-2 mt-2">
        {sections.map((section, si) => (
          <SidebarGroup key={si} className="mb-1">
            {!collapsed && (
              <SidebarGroupLabel className="text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40 px-3 mb-1.5">
                {section.label}
              </SidebarGroupLabel>
            )}
            {si > 0 && collapsed && <div className="h-px bg-border/20 mx-2 my-2" />}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === '/app'}
                        className="group relative flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-all duration-300"
                        activeClassName="nav-active bg-primary/5 text-primary font-semibold"
                      >
                        <div className="h-7 w-7 rounded-lg bg-muted/20 group-hover:bg-muted/30 flex items-center justify-center transition-all duration-300 shrink-0">
                          <item.icon className="h-3.5 w-3.5" />
                        </div>
                        {!collapsed && <span className="font-medium">{item.title}</span>}
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

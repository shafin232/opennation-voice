import {
  Shield, AlertTriangle, TrendingUp, CheckCircle, FileSearch, Unlock,
  Activity, Archive, ScrollText, MapPin, UserCog
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';

export function AdminSidebar() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const isSuperadmin = user?.role === 'superadmin';

  const sections = [
    {
      label: 'পরিচালনা',
      items: [
        { title: t('moderation'), url: '/admin', icon: Shield },
        ...(isSuperadmin ? [{ title: t('crisisMode'), url: '/admin/crisis-mode', icon: AlertTriangle }] : []),
      ],
    },
    {
      label: 'বিশ্লেষণ',
      items: [
        { title: t('tenderAnalysis'), url: '/admin/tenders', icon: TrendingUp },
        { title: t('voteAnomaly'), url: '/admin/vote-anomaly', icon: Activity },
        { title: t('districtIntegrity'), url: '/admin/district-integrity', icon: MapPin },
      ],
    },
    {
      label: 'অনুমোদন ও প্রতিক্রিয়া',
      items: [
        { title: t('projectApproval'), url: '/admin/project-approval', icon: CheckCircle },
        { title: t('rtiResponse'), url: '/admin/rti-response', icon: FileSearch },
        ...(isSuperadmin ? [{ title: t('identityUnlock'), url: '/admin/identity-unlock', icon: Unlock }] : []),
      ],
    },
    {
      label: 'আর্কাইভ',
      items: [
        { title: t('evidenceVault'), url: '/admin/evidence-vault', icon: Archive },
        { title: t('auditLogs'), url: '/admin/audit-logs', icon: ScrollText },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-[hsl(var(--border-subtle))] glass-sidebar">
      <SidebarHeader className="p-4 pb-3">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="font-bengali font-bold text-sm text-sidebar-foreground leading-none">{t('adminPanel')}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-bengali">Control Center</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-destructive" />
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
                        end={item.url === '/admin'}
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

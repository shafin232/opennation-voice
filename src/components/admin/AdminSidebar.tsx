import {
  Shield, AlertTriangle, TrendingUp, CheckCircle, FileSearch, Unlock,
  Activity, Archive, ScrollText, MapPin
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

  const items = [
    { title: t('moderation'), url: '/admin', icon: Shield },
    { title: t('crisisMode'), url: '/admin/crisis-mode', icon: AlertTriangle, superadminOnly: true },
    { title: t('tenderAnalysis'), url: '/admin/tenders', icon: TrendingUp },
    { title: t('projectApproval'), url: '/admin/project-approval', icon: CheckCircle },
    { title: t('rtiResponse'), url: '/admin/rti-response', icon: FileSearch },
    { title: t('identityUnlock'), url: '/admin/identity-unlock', icon: Unlock, superadminOnly: true },
    { title: t('voteAnomaly'), url: '/admin/vote-anomaly', icon: Activity },
    { title: t('evidenceVault'), url: '/admin/evidence-vault', icon: Archive },
    { title: t('auditLogs'), url: '/admin/audit-logs', icon: ScrollText },
    { title: t('districtIntegrity'), url: '/admin/district-integrity', icon: MapPin },
  ].filter(item => !item.superadminOnly || isSuperadmin);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="font-bold text-sm text-sidebar-foreground leading-none">{t('adminPanel')}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">প্রশাসন নিয়ন্ত্রণ</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-destructive" />
            </div>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground px-3">
            {!collapsed && 'প্রশাসন'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/admin'} 
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all" 
                      activeClassName="bg-primary/10 text-primary font-semibold shadow-sm"
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

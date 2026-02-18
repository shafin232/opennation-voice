import {
  Shield, AlertTriangle, TrendingUp, CheckCircle, FileSearch, Unlock,
  Activity, Archive, ScrollText, MapPin
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from '@/components/ui/sidebar';

export function AdminSidebar() {
  const { t } = useLanguage();
  const { user } = useAuth();
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
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('adminPanel')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === '/admin'} className="hover:bg-muted/50" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
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

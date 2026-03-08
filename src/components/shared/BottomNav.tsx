import { NavLink } from 'react-router-dom';
import { Home, FileText, BarChart3, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface BottomNavProps {
  variant?: 'citizen' | 'admin';
}

export function BottomNav({ variant = 'citizen' }: BottomNavProps) {
  const { t } = useLanguage();

  const citizenItems = [
    { to: '/app', icon: Home, label: t('feed') },
    { to: '/app/submit-report', icon: FileText, label: t('submitReport') },
    { to: '/app/integrity', icon: BarChart3, label: t('integrity') },
    { to: '/app/profile', icon: User, label: t('profile') },
  ];

  const adminItems = [
    { to: '/admin', icon: Home, label: t('moderation') },
    { to: '/admin/tenders', icon: BarChart3, label: t('tenderAnalysis') },
    { to: '/admin/audit-logs', icon: FileText, label: t('auditLogs') },
    { to: '/admin/district-integrity', icon: User, label: t('districtIntegrity') },
  ];

  const items = variant === 'citizen' ? citizenItems : adminItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-nav border-t border-[hsl(var(--border-subtle))]">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/app' || item.to === '/admin'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium font-bengali">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

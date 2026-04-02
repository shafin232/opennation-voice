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
    <nav className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <div className="glass-panel rounded-2xl flex items-center justify-around h-16 px-2 mx-auto max-w-md">
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/app' || item.to === '/admin'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-300 ${
                isActive ? 'text-primary' : 'text-muted-foreground/50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isActive ? 'bg-primary/10 glow-neon' : ''
                }`}>
                  <item.icon className={`h-4 w-4 transition-all ${isActive ? 'scale-110' : ''}`} />
                </div>
                <span className="text-[9px] font-semibold tracking-wide">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

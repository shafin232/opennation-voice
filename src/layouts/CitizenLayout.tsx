import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { CitizenSidebar } from '@/components/citizen/CitizenSidebar';
import { CrisisBanner } from '@/components/shared/CrisisBanner';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { BottomNav } from '@/components/shared/BottomNav';
import { Bell, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

export default function CitizenLayout() {
  const { logout, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full mesh-gradient-subtle">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <CitizenSidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <CrisisBanner />
          <header className="h-14 border-b border-[hsl(var(--border-subtle))] flex items-center justify-between px-4 md:px-6 glass-nav sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hidden md:flex hover:bg-muted/50" />
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="font-bengali font-bold text-sm leading-none">{t('appName')}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight mt-0.5 font-bengali">নাগরিক পোর্টাল</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {user && (
                <Badge variant="secondary" className="hidden md:flex text-xs font-normal gap-1.5 px-2.5 py-1 mr-1 bg-muted/50">
                  <div className="h-1.5 w-1.5 rounded-full bg-success" />
                  {user.name}
                </Badge>
              )}
              <Button variant="ghost" size="icon" onClick={() => navigate('/app/notifications')} className="relative h-8 w-8">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-background" />
              </Button>
              <LanguageToggle />
              <ThemeToggle />
              <div className="w-px h-5 bg-border/50 mx-1 hidden sm:block" />
              <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-destructive h-8 w-8">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto pb-20 md:pb-8">
            <Outlet />
          </main>
        </div>
        <BottomNav variant="citizen" />
      </div>
    </SidebarProvider>
  );
}

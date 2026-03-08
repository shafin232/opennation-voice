import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { CitizenSidebar } from '@/components/citizen/CitizenSidebar';
import { CrisisBanner } from '@/components/shared/CrisisBanner';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
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
      <div className="min-h-screen flex w-full bg-background">
        <CitizenSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <CrisisBanner />
          <header className="h-16 border-b border-border/60 flex items-center justify-between px-4 md:px-6 bg-card/80 backdrop-blur-xl sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hover:bg-muted" />
              <div className="hidden sm:flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm leading-none">{t('appName')}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">নাগরিক পোর্টাল</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {user && (
                <Badge variant="secondary" className="hidden md:flex text-xs font-normal gap-1.5 px-2.5 py-1 mr-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-success" />
                  {user.name}
                </Badge>
              )}
              <Button variant="ghost" size="icon" onClick={() => navigate('/app/notifications')} className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-destructive border-2 border-card" />
              </Button>
              <LanguageToggle />
              <ThemeToggle />
              <div className="w-px h-6 bg-border mx-1 hidden sm:block" />
              <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-destructive">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8 overflow-auto animate-fade-in">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

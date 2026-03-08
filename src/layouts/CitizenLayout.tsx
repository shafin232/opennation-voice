import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { CitizenSidebar } from '@/components/citizen/CitizenSidebar';
import { CrisisBanner } from '@/components/shared/CrisisBanner';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { BottomNav } from '@/components/shared/BottomNav';
import { Bell, LogOut, Shield, Menu } from 'lucide-react';
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
      <div className="min-h-screen flex w-full mesh-gradient-subtle noise-overlay">
        {/* Desktop sidebar */}
        <div className="hidden md:block relative z-10">
          <CitizenSidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <CrisisBanner />

          {/* Premium top bar */}
          <header className="h-14 border-b border-[hsl(var(--border-subtle))] flex items-center justify-between px-4 md:px-8 glass-nav sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hidden md:flex hover:bg-muted/30 h-8 w-8 rounded-lg transition-colors" />
              <div className="flex md:hidden items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow-teal">
                  <Shield className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow-teal">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bengali font-bold text-sm leading-none tracking-tight">{t('appName')}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight mt-0.5 font-bengali">নাগরিক পোর্টাল</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {user && (
                <Badge variant="secondary" className="hidden lg:flex text-[11px] font-normal gap-1.5 px-3 py-1 mr-2 bg-muted/30 border border-[hsl(var(--border-subtle))]">
                  <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  {user.name}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/app/notifications')}
                className="relative h-8 w-8 rounded-lg hover:bg-muted/30 transition-all btn-press"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background animate-pulse" />
              </Button>
              <LanguageToggle />
              <ThemeToggle />
              <div className="w-px h-5 bg-border/30 mx-1.5 hidden sm:block" />
              <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-destructive h-8 w-8 rounded-lg btn-press">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 lg:p-10 overflow-auto pb-20 md:pb-10">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
        <BottomNav variant="citizen" />
      </div>
    </SidebarProvider>
  );
}

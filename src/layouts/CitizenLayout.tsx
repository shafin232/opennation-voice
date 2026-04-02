import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { CitizenSidebar } from '@/components/citizen/CitizenSidebar';
import { CrisisBanner } from '@/components/shared/CrisisBanner';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { BottomNav } from '@/components/shared/BottomNav';
import { Bell, LogOut, Shield, Zap } from 'lucide-react';
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
      <div className="min-h-screen flex w-full mesh-bg grain">
        {/* Desktop sidebar */}
        <div className="hidden md:block relative z-10">
          <CitizenSidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <CrisisBanner />

          {/* Top bar — ultra minimal */}
          <header className="h-14 border-b border-border/40 flex items-center justify-between px-4 md:px-8 glass-nav sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hidden md:flex hover:bg-muted/30 h-8 w-8 rounded-lg transition-colors" />
              <div className="flex md:hidden items-center gap-2">
                <div className="h-8 w-8 rounded-xl gradient-neon flex items-center justify-center glow-neon">
                  <Shield className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-sm tracking-tight">ON</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {user && (
                <div className="hidden lg:flex items-center gap-2 mr-3 px-3 py-1.5 rounded-full bg-muted/30 border border-border/50">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[11px] font-medium text-muted-foreground">{user.name}</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/app/notifications')}
                className="relative h-8 w-8 rounded-xl hover:bg-muted/30 transition-all"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
              </Button>
              <LanguageToggle />
              <ThemeToggle />
              <div className="w-px h-5 bg-border/30 mx-1 hidden sm:block" />
              <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-destructive h-8 w-8 rounded-xl">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 lg:p-10 overflow-auto pb-24 md:pb-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
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

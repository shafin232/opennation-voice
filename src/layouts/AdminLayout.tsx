import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { CrisisBanner } from '@/components/shared/CrisisBanner';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { BottomNav } from '@/components/shared/BottomNav';
import { LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const { t } = useLanguage();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full mesh-gradient-subtle noise-overlay">
        <div className="hidden md:block relative z-10">
          <AdminSidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <CrisisBanner />
          <header className="h-14 border-b border-[hsl(var(--border-subtle))] flex items-center justify-between px-4 md:px-8 glass-nav sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hidden md:flex hover:bg-muted/30 h-8 w-8 rounded-lg" />
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-destructive" />
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="font-bengali font-bold text-sm leading-none">{t('adminPanel')}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight mt-0.5 font-bengali">প্রশাসন নিয়ন্ত্রণ</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {user && (
                <Badge variant="outline" className="hidden lg:flex text-[11px] font-normal gap-1.5 px-3 py-1 mr-2 border-destructive/20 text-destructive bg-destructive/5">
                  <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
                  {user.role}
                </Badge>
              )}
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
        <BottomNav variant="admin" />
      </div>
    </SidebarProvider>
  );
}

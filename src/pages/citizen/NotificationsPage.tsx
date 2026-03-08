import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNotifications } from '@/hooks/useNotifications';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Bell, CheckCheck, BellOff } from 'lucide-react';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const slamIn = {
  hidden: { scale: 0.95, opacity: 0, y: 6 },
  show: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 28 } },
};

export default function NotificationsPage() {
  const { notifications, loading, error, fetchNotifications, markRead } = useNotifications();
  const { t } = useLanguage();

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bengali font-bold text-foreground tracking-tight leading-none">{t('notifications')}</h1>
            <p className="text-sm text-muted-foreground mt-1 font-bengali">আপনার সর্বশেষ বিজ্ঞপ্তি</p>
          </div>
        </div>
      </motion.div>

      {error && <ErrorBanner message={error} onRetry={fetchNotifications} />}

      {loading ? <LoadingSkeleton rows={5} type="list" /> : notifications.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
          <div className="h-20 w-20 rounded-3xl glass-card flex items-center justify-center mx-auto mb-6">
            <BellOff className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-bengali font-semibold text-foreground mb-2">কোনো বিজ্ঞপ্তি নেই</h3>
          <p className="text-sm text-muted-foreground font-bengali">নতুন বিজ্ঞপ্তি পেলে এখানে দেখা যাবে।</p>
        </motion.div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
          {notifications.map(n => (
            <motion.div key={n.id} variants={slamIn} whileHover={{ y: -1, transition: { duration: 0.15 } }}>
              <div
                className={`glass-card p-4 rounded-2xl cursor-pointer transition-all duration-200 ${
                  !n.read ? 'border-primary/15 shadow-glow-teal' : ''
                }`}
                onClick={() => !n.read && markRead(n.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${!n.read ? 'bg-primary/10' : 'bg-muted/30'}`}>
                    <Bell className={`h-4 w-4 ${!n.read ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] leading-snug ${!n.read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                    <p className="text-[10px] text-muted-foreground/50 mt-1.5 font-mono-data">{new Date(n.createdAt).toLocaleString('bn-BD')}</p>
                  </div>
                  {n.read && <CheckCheck className="h-4 w-4 text-muted-foreground/30 shrink-0 mt-1" />}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

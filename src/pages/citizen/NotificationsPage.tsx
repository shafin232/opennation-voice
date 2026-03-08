import { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, loading, error, fetchNotifications, markRead } = useNotifications();
  const { t } = useLanguage();

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('notifications')}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">আপনার সর্বশেষ বিজ্ঞপ্তি</p>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchNotifications} />}

      {loading ? <LoadingSkeleton rows={5} type="list" /> : notifications.length === 0 ? (
        <div className="text-center py-16">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">{t('noData')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <Card
              key={n.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-sm border-border/60 ${!n.read ? 'bg-primary/[0.03] border-primary/20 shadow-sm' : ''}`}
              onClick={() => !n.read && markRead(n.id)}
            >
              <CardContent className="flex items-start gap-3 py-3.5 px-4">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${!n.read ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Bell className={`h-4 w-4 ${!n.read ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                  <p className="text-[10px] text-muted-foreground mt-1.5">{new Date(n.createdAt).toLocaleString('bn-BD')}</p>
                </div>
                {n.read && <CheckCheck className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-1" />}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

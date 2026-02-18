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
    <div className="space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground">{t('notifications')}</h1>

      {error && <ErrorBanner message={error} onRetry={fetchNotifications} />}

      {loading ? <LoadingSkeleton rows={5} type="list" /> : notifications.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">{t('noData')}</p>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <Card
              key={n.id}
              className={`cursor-pointer transition-colors ${!n.read ? 'border-primary/30 bg-primary/5' : ''}`}
              onClick={() => !n.read && markRead(n.id)}
            >
              <CardContent className="flex items-start gap-3 py-3">
                <Bell className={`h-4 w-4 mt-0.5 shrink-0 ${!n.read ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString('bn-BD')}</p>
                </div>
                {n.read && <CheckCheck className="h-4 w-4 text-muted-foreground shrink-0" />}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

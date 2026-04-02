import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Notification } from '@/types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;

      const items: Notification[] = (data ?? []).map(n => ({
        id: n.id,
        title: n.title,
        body: n.body,
        type: n.type as any,
        read: n.read,
        createdAt: n.created_at,
      }));

      setNotifications(items);
      setUnreadCount(items.filter(n => !n.read).length);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  const markRead = useCallback(async (id: string) => {
    try {
      const { error: err } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (err) throw err;

      // Refetch from server after confirmed update
      await fetchNotifications();
    } catch (err: any) {
      setError(err.message || 'Failed to mark notification');
    }
  }, [fetchNotifications]);

  return { notifications, unreadCount, loading, error, fetchNotifications, markRead };
}

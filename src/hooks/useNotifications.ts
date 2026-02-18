import { useState, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import type { Notification, PaginatedResponse, ApiResponse } from '@/types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<PaginatedResponse<Notification>>('/notifications');
      setNotifications(data.data);
      setUnreadCount(data.data.filter(n => !n.read).length);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  const markRead = useCallback(async (id: string) => {
    try {
      await apiClient.patch<ApiResponse<null>>(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark notification');
    }
  }, []);

  return { notifications, unreadCount, loading, error, fetchNotifications, markRead };
}

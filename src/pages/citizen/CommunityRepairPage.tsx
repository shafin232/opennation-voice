import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Wrench, MapPin } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import type { RepairRequest, PaginatedResponse, ApiResponse } from '@/types';

export default function CommunityRepairPage() {
  const { t } = useLanguage();
  const { crisisMode } = useApp();
  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', district: '', category: 'road' as RepairRequest['category'] });
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await apiClient.get<PaginatedResponse<RepairRequest>>('/community-repair');
      setRequests(data.data);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await apiClient.post<ApiResponse<RepairRequest>>('/community-repair', {
        title: form.title, description: form.description,
        location: { district: form.district },
        category: form.category,
      });
      toast.success(t('success'));
      setOpen(false);
      setForm({ title: '', description: '', district: '', category: 'road' });
      fetchRequests();
    } catch { /* handled */ }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t('communityRepair')}</h1>
        {!crisisMode.active && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />{t('submit')}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>মেরামত আবেদন</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>শিরোনাম</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
                <div><Label>বিবরণ</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
                <div><Label>জেলা</Label><Input value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} /></div>
                <div>
                  <Label>বিভাগ</Label>
                  <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="road">রাস্তা</SelectItem>
                      <SelectItem value="water">পানি</SelectItem>
                      <SelectItem value="electricity">বিদ্যুৎ</SelectItem>
                      <SelectItem value="sanitation">স্যানিটেশন</SelectItem>
                      <SelectItem value="other">অন্যান্য</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleSubmit} disabled={submitting || !form.title.trim()}>
                  {submitting ? t('loading') : t('submit')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchRequests} />}

      {loading ? <LoadingSkeleton rows={4} type="list" /> : requests.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">{t('noData')}</p>
      ) : (
        <div className="space-y-3">
          {requests.map(req => (
            <Card key={req.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-sm">{req.title}</CardTitle>
                  </div>
                  <Badge variant="secondary">{req.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{req.description}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />{req.location.district}
                  <span>· সমর্থন: {req.supportCount}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

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
import { Plus, Wrench, MapPin, ThumbsUp } from 'lucide-react';
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

  const categoryIcons: Record<string, string> = {
    road: '🛣️', water: '💧', electricity: '⚡', sanitation: '🚰', other: '🔧'
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
            <Wrench className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('communityRepair')}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">এলাকার মেরামত আবেদন</p>
          </div>
        </div>
        {!crisisMode.active && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 gradient-primary border-0 shadow-sm"><Plus className="h-4 w-4" />{t('submit')}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle className="text-lg">মেরামত আবেদন</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">শিরোনাম</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="h-11 bg-muted/30" /></div>
                <div className="space-y-1.5"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">বিবরণ</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="bg-muted/30 resize-none" /></div>
                <div className="space-y-1.5"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">জেলা</Label><Input value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} className="h-11 bg-muted/30" /></div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">বিভাগ</Label>
                  <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as any }))}>
                    <SelectTrigger className="h-11 bg-muted/30"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="road">🛣️ রাস্তা</SelectItem>
                      <SelectItem value="water">💧 পানি</SelectItem>
                      <SelectItem value="electricity">⚡ বিদ্যুৎ</SelectItem>
                      <SelectItem value="sanitation">🚰 স্যানিটেশন</SelectItem>
                      <SelectItem value="other">🔧 অন্যান্য</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full h-11 gradient-primary border-0" onClick={handleSubmit} disabled={submitting || !form.title.trim()}>
                  {submitting ? t('loading') : t('submit')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchRequests} />}

      {loading ? <LoadingSkeleton rows={4} type="list" /> : requests.length === 0 ? (
        <div className="text-center py-16">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Wrench className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">{t('noData')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => (
            <Card key={req.id} className="border-border/60 hover:shadow-sm transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{categoryIcons[req.category] || '🔧'}</span>
                    <CardTitle className="text-sm leading-snug">{req.title}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-xs">{req.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{req.description}</p>
                <div className="flex items-center gap-3 mt-2.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{req.location.district}</span>
                  <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />সমর্থন: {req.supportCount}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

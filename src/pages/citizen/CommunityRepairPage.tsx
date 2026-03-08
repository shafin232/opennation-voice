import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Wrench, MapPin, ThumbsUp, HardHat } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { RepairRequest } from '@/types';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const slamIn = {
  hidden: { scale: 0.92, opacity: 0, y: 8 },
  show: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 28 } },
};

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
      setRequests(data.data ?? []);
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
    <div className="space-y-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-warning/10 flex items-center justify-center">
              <Wrench className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bengali font-bold text-foreground tracking-tight leading-none">{t('communityRepair')}</h1>
              <p className="text-sm text-muted-foreground mt-1 font-bengali">এলাকার মেরামত আবেদন</p>
            </div>
          </div>
          {!crisisMode.active && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground shadow-glow-teal btn-press rounded-xl">
                  <Plus className="h-4 w-4" />{t('submit')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md glass-strong border-[hsl(var(--border-subtle))]">
                <DialogHeader><DialogTitle className="text-lg font-bengali">মেরামত আবেদন</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5"><Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">শিরোনাম</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="h-11 bg-muted/10 border-[hsl(var(--border-subtle))] rounded-xl" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">বিবরণ</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="bg-muted/10 resize-none border-[hsl(var(--border-subtle))] rounded-xl" /></div>
                  <div className="space-y-1.5"><Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">জেলা</Label><Input value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} className="h-11 bg-muted/10 border-[hsl(var(--border-subtle))] rounded-xl" /></div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">বিভাগ</Label>
                    <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as any }))}>
                      <SelectTrigger className="h-11 bg-muted/10 border-[hsl(var(--border-subtle))] rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="road">🛣️ রাস্তা</SelectItem>
                        <SelectItem value="water">💧 পানি</SelectItem>
                        <SelectItem value="electricity">⚡ বিদ্যুৎ</SelectItem>
                        <SelectItem value="sanitation">🚰 স্যানিটেশন</SelectItem>
                        <SelectItem value="other">🔧 অন্যান্য</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full h-11 bg-primary text-primary-foreground shadow-glow-teal btn-press rounded-xl font-bengali" onClick={handleSubmit} disabled={submitting || !form.title.trim()}>
                    {submitting ? t('loading') : t('submit')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </motion.div>

      {error && <ErrorBanner message={error} onRetry={fetchRequests} />}

      {loading ? <LoadingSkeleton rows={4} type="list" /> : requests.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
          <div className="h-20 w-20 rounded-3xl glass-card flex items-center justify-center mx-auto mb-6">
            <HardHat className="h-10 w-10 text-warning/40" />
          </div>
          <h3 className="text-lg font-bengali font-semibold text-foreground mb-2">কোনো মেরামত আবেদন নেই</h3>
          <p className="text-sm text-muted-foreground font-bengali mb-6">আপনার এলাকার মেরামত প্রয়োজন জানান।</p>
          {!crisisMode.active && (
            <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground shadow-glow-teal font-bengali btn-press gap-2">
              <Plus className="h-4 w-4" />আবেদন করুন
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
          {requests.map(req => (
            <motion.div key={req.id} variants={slamIn} whileHover={{ y: -2, transition: { duration: 0.2 } }}>
              <div className="glass-card p-5 rounded-2xl gradient-shine transition-all duration-300">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{categoryIcons[req.category] || '🔧'}</span>
                    <h3 className="text-sm font-semibold font-bengali leading-snug">{req.title}</h3>
                  </div>
                  <Badge className="shrink-0 text-[10px] bg-muted/30 border-[hsl(var(--border-subtle))] text-muted-foreground">{req.status}</Badge>
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{req.description}</p>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[hsl(var(--border-subtle))] text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{req.location.district}</span>
                  <span className="flex items-center gap-1 font-mono-data"><ThumbsUp className="h-3 w-3" />{req.supportCount}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

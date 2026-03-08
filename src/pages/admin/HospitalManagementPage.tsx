import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useHospitals } from '@/hooks/useHospitals';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Hospital, Plus, Pencil, Trash2, Bed, Star, MapPin, Save, X, HeartPulse
} from 'lucide-react';

interface HospitalForm {
  name: string;
  district: string;
  type: 'government' | 'private';
  total_beds: number;
  available_beds: number;
  rating: number;
  services: string;
}

const emptyForm: HospitalForm = {
  name: '', district: '', type: 'government',
  total_beds: 0, available_beds: 0, rating: 0, services: '',
};

export default function HospitalManagementPage() {
  const { hospitals, loading, error, fetchHospitals } = useHospitals();
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<HospitalForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchHospitals(); }, [fetchHospitals]);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (h: any) => {
    setEditId(h.id);
    setForm({
      name: h.name,
      district: h.district,
      type: h.type,
      total_beds: h.totalBeds,
      available_beds: h.availableBeds,
      rating: h.rating,
      services: h.services.join(', '),
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        district: form.district.trim(),
        type: form.type,
        total_beds: form.total_beds,
        available_beds: form.available_beds,
        rating: form.rating,
        services: form.services.split(',').map(s => s.trim()).filter(Boolean),
      };

      if (editId) {
        const { error: err } = await supabase.from('hospitals').update(payload).eq('id', editId);
        if (err) throw err;
        toast.success('হাসপাতাল আপডেট হয়েছে');
      } else {
        const { error: err } = await supabase.from('hospitals').insert(payload);
        if (err) throw err;
        toast.success('হাসপাতাল যোগ হয়েছে');
      }
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      fetchHospitals();
    } catch (err: any) {
      toast.error(err.message || 'ব্যর্থ');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { error: err } = await supabase.from('hospitals').delete().eq('id', deleteTarget);
      if (err) throw err;
      toast.success('হাসপাতাল মুছে ফেলা হয়েছে');
      setDeleteTarget(null);
      fetchHospitals();
    } catch (err: any) {
      toast.error(err.message || 'ব্যর্থ');
    }
    setDeleting(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
            <Hospital className="h-5 w-5 text-success" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">হাসপাতাল ম্যানেজমেন্ট</h1>
            <p className="text-xs text-muted-foreground mt-0.5">হাসপাতাল যোগ, সম্পাদনা ও মুছুন</p>
          </div>
        </div>
        <Button onClick={openAdd} className="gap-1.5 bg-primary text-primary-foreground rounded-xl">
          <Plus className="h-4 w-4" /> নতুন হাসপাতাল
        </Button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-panel p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                {editId ? <Pencil className="h-4 w-4 text-primary" /> : <Plus className="h-4 w-4 text-primary" />}
                {editId ? 'হাসপাতাল সম্পাদনা' : 'নতুন হাসপাতাল যোগ'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">নাম *</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-10 rounded-xl bg-muted/10" placeholder="হাসপাতালের নাম" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">জেলা</Label>
                  <Input value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} className="h-10 rounded-xl bg-muted/10" placeholder="জেলার নাম" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">ধরন</Label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))} className="w-full h-10 rounded-xl bg-muted/10 border border-border/40 px-3 text-sm">
                    <option value="government">সরকারি</option>
                    <option value="private">বেসরকারি</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">রেটিং (০-৫)</Label>
                  <Input type="number" min={0} max={5} step={0.1} value={form.rating} onChange={e => setForm(f => ({ ...f, rating: parseFloat(e.target.value) || 0 }))} className="h-10 rounded-xl bg-muted/10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">মোট শয্যা</Label>
                  <Input type="number" value={form.total_beds} onChange={e => setForm(f => ({ ...f, total_beds: parseInt(e.target.value) || 0 }))} className="h-10 rounded-xl bg-muted/10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">খালি শয্যা</Label>
                  <Input type="number" value={form.available_beds} onChange={e => setForm(f => ({ ...f, available_beds: parseInt(e.target.value) || 0 }))} className="h-10 rounded-xl bg-muted/10" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">সেবা (কমা দিয়ে আলাদা)</Label>
                  <Input value={form.services} onChange={e => setForm(f => ({ ...f, services: e.target.value }))} className="h-10 rounded-xl bg-muted/10" placeholder="জরুরি, সার্জারি, ICU, ডায়ালাইসিস" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} disabled={saving || !form.name.trim()} className="gap-1.5 bg-primary text-primary-foreground rounded-xl">
                  <Save className="h-3.5 w-3.5" /> {editId ? 'আপডেট' : 'যোগ করুন'}
                </Button>
                <Button variant="ghost" onClick={() => { setShowForm(false); setEditId(null); }} className="rounded-xl">বাতিল</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <ErrorBanner message={error} onRetry={() => fetchHospitals()} />}

      {loading ? <LoadingSkeleton rows={4} /> : hospitals.length === 0 ? (
        <div className="text-center py-16">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-muted/20 flex items-center justify-center mb-4">
            <HeartPulse className="h-8 w-8 text-muted-foreground/30" />
          </div>
          <p className="text-muted-foreground font-medium">কোনো হাসপাতাল নেই</p>
        </div>
      ) : (
        <div className="space-y-3">
          {hospitals.map(h => {
            const occupancy = h.totalBeds > 0 ? ((h.totalBeds - h.availableBeds) / h.totalBeds) * 100 : 0;
            const isHigh = occupancy > 80;
            return (
              <motion.div key={h.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <div className="glass-panel rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${h.type === 'government' ? 'bg-primary/10' : 'bg-accent/10'}`}>
                        <Hospital className={`h-4 w-4 ${h.type === 'government' ? 'text-primary' : 'text-accent'}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">{h.name}</h3>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{h.district || '—'}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1"><Star className="h-2.5 w-2.5 text-warning" />{h.rating}/5</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge className={`text-[10px] border-0 ${h.type === 'government' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                        {h.type === 'government' ? 'সরকারি' : 'বেসরকারি'}
                      </Badge>
                      <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={() => openEdit(h)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-destructive hover:text-destructive" onClick={() => setDeleteTarget(h.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Bed occupancy */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="flex items-center gap-1 font-medium"><Bed className="h-3 w-3" />শয্যা ব্যবহার</span>
                      <span className={`font-mono text-xs font-semibold ${isHigh ? 'text-destructive' : 'text-success'}`}>{h.availableBeds}/{h.totalBeds} খালি</span>
                    </div>
                    <Progress value={occupancy} className={`h-2 rounded-full ${isHigh ? '[&>div]:bg-destructive' : '[&>div]:bg-success'}`} />
                  </div>

                  {/* Services */}
                  {h.services.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {h.services.map(s => (
                        <Badge key={s} variant="outline" className="text-[10px] font-normal px-2 py-0.5 rounded-lg">{s}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
        title="হাসপাতাল মুছে ফেলুন"
        description="এই হাসপাতালটি স্থায়ীভাবে মুছে ফেলা হবে।"
        onConfirm={handleDelete}
        destructive
        loading={deleting}
      />
    </div>
  );
}

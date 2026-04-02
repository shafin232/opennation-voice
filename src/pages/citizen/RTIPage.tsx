import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRTI } from '@/hooks/useRTI';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, FileSearch, MessageSquare, FileQuestion } from 'lucide-react';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const slamIn = {
  hidden: { scale: 0.92, opacity: 0, y: 8 },
  show: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 400, damping: 28 } },
};

export default function RTIPage() {
  const { requests, loading, error, fetchRequests, submitRequest } = useRTI();
  const { t } = useLanguage();
  const { crisisMode } = useApp();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [department, setDepartment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitRequest({ subject, body, department });
      toast.success(t('success'));
      setOpen(false);
      setSubject(''); setBody(''); setDepartment('');
      fetchRequests();
    } catch { /* handled */ }
    finally { setSubmitting(false); }
  };

  const statusConfig: Record<string, string> = {
    submitted: 'bg-warning/10 text-warning border-warning/10',
    processing: 'bg-primary/10 text-primary border-primary/10',
    responded: 'bg-success/10 text-success border-success/10',
    appealed: 'bg-destructive/10 text-destructive border-destructive/10',
    closed: 'bg-muted/50 text-muted-foreground border-border',
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileSearch className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bengali font-bold text-foreground tracking-tight leading-none">{t('rti')}</h1>
              <p className="text-sm text-muted-foreground mt-1 font-bengali">তথ্য অধিকার আবেদন</p>
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
                <DialogHeader><DialogTitle className="text-lg font-bengali">নতুন তথ্য অধিকার আবেদন</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">বিষয়</Label>
                    <Input value={subject} onChange={e => setSubject(e.target.value)} className="h-11 bg-muted/10 border-[hsl(var(--border-subtle))] rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">বিভাগ</Label>
                    <Input value={department} onChange={e => setDepartment(e.target.value)} className="h-11 bg-muted/10 border-[hsl(var(--border-subtle))] rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">বিবরণ</Label>
                    <Textarea value={body} onChange={e => setBody(e.target.value)} rows={4} className="bg-muted/10 resize-none border-[hsl(var(--border-subtle))] rounded-xl" />
                  </div>
                  <Button className="w-full h-11 bg-primary text-primary-foreground shadow-glow-teal btn-press rounded-xl font-bengali" onClick={handleSubmit} disabled={submitting || !subject.trim()}>
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
            <FileQuestion className="h-10 w-10 text-primary/40" />
          </div>
          <h3 className="text-lg font-bengali font-semibold text-foreground mb-2">কোনো আবেদন নেই</h3>
          <p className="text-sm text-muted-foreground font-bengali mb-6">প্রথম তথ্য অধিকার আবেদন জমা দিন।</p>
          {!crisisMode.active && (
            <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground shadow-glow-teal font-bengali btn-press gap-2">
              <Plus className="h-4 w-4" />নতুন আবেদন
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
          {requests.map(req => (
            <motion.div key={req.id} variants={slamIn} whileHover={{ y: -2, transition: { duration: 0.2 } }}>
              <div className="glass-card p-5 rounded-2xl gradient-shine transition-all duration-300">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-sm font-semibold font-bengali leading-snug">{req.subject}</h3>
                  <Badge className={`shrink-0 text-[10px] font-medium border ${statusConfig[req.status] || ''}`}>{req.status}</Badge>
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed mb-2">{req.body}</p>
                <p className="text-xs text-muted-foreground/60 font-bengali">বিভাগ: {req.department}</p>
                {req.response && (
                  <div className="mt-3 p-4 rounded-xl bg-success/5 border border-success/10">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-success mb-1.5">
                      <MessageSquare className="h-3 w-3" /><span className="font-bengali">প্রতিক্রিয়া</span>
                    </div>
                    <p className="text-[13px] text-foreground leading-relaxed">{req.response}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

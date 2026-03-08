import { useEffect, useState } from 'react';
import { useRTI } from '@/hooks/useRTI';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, FileSearch, MessageSquare } from 'lucide-react';

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
    submitted: 'bg-warning/10 text-warning',
    processing: 'bg-primary/10 text-primary',
    responded: 'bg-success/10 text-success',
    appealed: 'bg-destructive/10 text-destructive',
    closed: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileSearch className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('rti')}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">তথ্য অধিকার আবেদন</p>
          </div>
        </div>
        {!crisisMode.active && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 gradient-primary border-0 shadow-sm"><Plus className="h-4 w-4" />{t('submit')}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle className="text-lg">নতুন তথ্য অধিকার আবেদন</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">বিষয়</Label><Input value={subject} onChange={e => setSubject(e.target.value)} className="h-11 bg-muted/30" /></div>
                <div className="space-y-1.5"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">বিভাগ</Label><Input value={department} onChange={e => setDepartment(e.target.value)} className="h-11 bg-muted/30" /></div>
                <div className="space-y-1.5"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">বিবরণ</Label><Textarea value={body} onChange={e => setBody(e.target.value)} rows={4} className="bg-muted/30 resize-none" /></div>
                <Button className="w-full h-11 gradient-primary border-0" onClick={handleSubmit} disabled={submitting || !subject.trim()}>
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
            <FileSearch className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">{t('noData')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => (
            <Card key={req.id} className="border-border/60 hover:shadow-sm transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-sm leading-snug">{req.subject}</CardTitle>
                  <Badge className={`shrink-0 text-xs font-medium border-0 ${statusConfig[req.status] || ''}`}>{req.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground leading-relaxed">{req.body}</p>
                <p className="text-xs text-muted-foreground">বিভাগ: {req.department}</p>
                {req.response && (
                  <div className="mt-3 p-3.5 rounded-xl bg-success/5 border border-success/15">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-success mb-1.5">
                      <MessageSquare className="h-3 w-3" />প্রতিক্রিয়া
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{req.response}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

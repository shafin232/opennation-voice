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
import { Plus } from 'lucide-react';

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

  const statusColor: Record<string, string> = {
    submitted: 'bg-yellow-500/10 text-yellow-700',
    processing: 'bg-blue-500/10 text-blue-700',
    responded: 'bg-green-500/10 text-green-700',
    appealed: 'bg-orange-500/10 text-orange-700',
    closed: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t('rti')}</h1>
        {!crisisMode.active && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />{t('submit')}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>নতুন তথ্য অধিকার আবেদন</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>বিষয়</Label><Input value={subject} onChange={e => setSubject(e.target.value)} /></div>
                <div><Label>বিভাগ</Label><Input value={department} onChange={e => setDepartment(e.target.value)} /></div>
                <div><Label>বিবরণ</Label><Textarea value={body} onChange={e => setBody(e.target.value)} rows={4} /></div>
                <Button className="w-full" onClick={handleSubmit} disabled={submitting || !subject.trim()}>
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
                  <CardTitle className="text-sm">{req.subject}</CardTitle>
                  <Badge className={statusColor[req.status] || ''}>{req.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{req.body}</p>
                <p className="text-xs text-muted-foreground mt-2">বিভাগ: {req.department}</p>
                {req.response && (
                  <div className="mt-3 p-3 rounded-md bg-muted">
                    <p className="text-xs font-medium mb-1">প্রতিক্রিয়া:</p>
                    <p className="text-sm">{req.response}</p>
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

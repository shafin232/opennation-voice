import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Unlock, Check, X, User, ShieldAlert, Plus, Search, Eye, EyeOff, FileText } from 'lucide-react';

interface RevealedIdentity {
  name: string;
  email: string | null;
  phone: string | null;
  district: string;
  citizenAlias: string | null;
}

export default function IdentityUnlockPage() {
  const { unlockRequests, loading, error, fetchUnlockRequests, processUnlock } = useAdmin();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [action, setAction] = useState<{ id: string; approved: boolean } | null>(null);
  const [processing, setProcessing] = useState(false);

  // New request form
  const [showForm, setShowForm] = useState(false);
  const [targetReportId, setTargetReportId] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Search for anonymous report authors
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Revealed identity
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const [revealedIdentity, setRevealedIdentity] = useState<RevealedIdentity | null>(null);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => { fetchUnlockRequests(); }, [fetchUnlockRequests]);

  const handleAction = async () => {
    if (!action) return;
    setProcessing(true);
    try {
      await processUnlock(action.id, action.approved);

      // Log to audit
      await supabase.from('audit_logs').insert({
        action: action.approved ? 'identity_unlock_approved' : 'identity_unlock_rejected',
        performed_by: user?.id,
        performed_by_role: user?.role || 'admin',
        target_type: 'identity_unlock_request',
        target_id: action.id,
        details: action.approved ? 'পরিচয় আনলক অনুমোদিত' : 'পরিচয় আনলক প্রত্যাখ্যাত',
      });

      toast.success(action.approved ? 'আনলক অনুমোদিত ✅' : 'আনলক প্রত্যাখ্যাত');
      setAction(null);
      fetchUnlockRequests();
    } catch { /* handled */ }
    finally { setProcessing(false); }
  };

  // Search anonymous reports
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const { data } = await supabase
        .from('reports')
        .select('id, title, district, created_at, author_id, is_anonymous')
        .eq('is_anonymous', true)
        .ilike('title', `%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(10);
      setSearchResults(data ?? []);
    } catch { }
    setSearching(false);
  };

  // Submit new unlock request
  const handleSubmitRequest = async (authorId: string) => {
    if (!reason.trim()) {
      toast.error('কারণ লিখুন');
      return;
    }
    setSubmitting(true);
    try {
      const { error: err } = await supabase.from('identity_unlock_requests').insert({
        requested_by: user?.id,
        target_user_id: authorId,
        reason: reason.trim(),
      });
      if (err) throw err;
      toast.success('আনলক অনুরোধ জমা হয়েছে');
      setShowForm(false);
      setReason('');
      setTargetReportId('');
      setSearchResults([]);
      setSearchQuery('');
      fetchUnlockRequests();
    } catch (err: any) {
      toast.error(err.message || 'ব্যর্থ');
    }
    setSubmitting(false);
  };

  // Reveal identity for approved requests (superadmin only)
  const handleReveal = async (targetUserId: string, requestId: string) => {
    setRevealing(true);
    setRevealedId(requestId);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('name, email, phone, district, citizen_alias')
        .eq('user_id', targetUserId)
        .single();
      if (data) {
        setRevealedIdentity({
          name: data.name,
          email: data.email,
          phone: data.phone,
          district: data.district,
          citizenAlias: data.citizen_alias,
        });
      }
    } catch { }
    setRevealing(false);
  };

  const isSuperadmin = user?.role === 'superadmin';

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
            <Unlock className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('identityUnlock')}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">বেনামী রিপোর্টারের পরিচয় আনলক (শুধুমাত্র সুপারঅ্যাডমিন)</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-1.5 bg-primary text-primary-foreground rounded-xl">
          <Plus className="h-4 w-4" /> নতুন অনুরোধ
        </Button>
      </div>

      {/* New Request Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="glass-panel p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" /> বেনামী রিপোর্ট খুঁজুন
              </h3>

              {/* Search anonymous reports */}
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="রিপোর্টের শিরোনাম দিয়ে খুঁজুন..."
                  className="h-10 rounded-xl bg-muted/10"
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={searching} className="rounded-xl bg-primary text-primary-foreground">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Search results */}
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map(r => (
                    <div key={r.id} className="p-3 rounded-xl bg-muted/10 border border-border/20 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{r.title}</p>
                        <p className="text-[10px] text-muted-foreground">{r.district} · {new Date(r.created_at).toLocaleDateString('bn-BD')}</p>
                      </div>
                      <Button size="sm" variant="outline" className="rounded-lg text-xs shrink-0" onClick={() => setTargetReportId(r.author_id)}>
                        নির্বাচন
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {targetReportId && (
                <div className="space-y-3 pt-2 border-t border-border/20">
                  <div className="p-2.5 rounded-xl bg-warning/5 border border-warning/15 text-xs">
                    <p className="font-medium text-warning">⚠️ নির্বাচিত ব্যবহারকারী: <span className="font-mono">{targetReportId.slice(0, 8)}...</span></p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">আনলকের কারণ *</Label>
                    <Textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} className="rounded-xl bg-muted/10 resize-none" placeholder="আদালতের নির্দেশ / তদন্তের প্রয়োজন..." />
                  </div>
                  <Button onClick={() => handleSubmitRequest(targetReportId)} disabled={submitting || !reason.trim()} className="gap-1.5 bg-primary text-primary-foreground rounded-xl">
                    <FileText className="h-3.5 w-3.5" /> অনুরোধ জমা দিন
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <ErrorBanner message={error} onRetry={fetchUnlockRequests} />}

      {loading ? <LoadingSkeleton rows={4} type="list" /> : unlockRequests.length === 0 ? (
        <div className="text-center py-16">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Unlock className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">{t('noData')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {unlockRequests.map(req => (
            <Card key={req.id} className="border-border/60 hover:shadow-sm transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-warning" />
                    </div>
                    <div>
                      <CardTitle className="text-sm leading-snug">ব্যবহারকারী: <span className="font-mono text-xs">{req.targetUserId.slice(0, 12)}...</span></CardTitle>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(req.createdAt).toLocaleDateString('bn-BD')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className={`shrink-0 text-xs ${
                    req.status === 'approved' ? 'bg-success/10 text-success' :
                    req.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                    'bg-warning/10 text-warning'
                  }`}>
                    {req.status === 'approved' ? '✅ অনুমোদিত' : req.status === 'rejected' ? '❌ প্রত্যাখ্যাত' : '⏳ অপেক্ষমাণ'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-xl bg-muted/50 space-y-1.5 text-sm">
                  <p className="text-muted-foreground"><span className="font-medium text-foreground">কারণ:</span> {req.reason}</p>
                  <p className="text-xs text-muted-foreground">অনুরোধকারী: <span className="font-mono">{req.requestedBy.slice(0, 12)}...</span></p>
                </div>

                {/* Pending: Approve/Reject (superadmin only) */}
                {req.status === 'pending' && isSuperadmin && (
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" onClick={() => setAction({ id: req.id, approved: true })} className="gap-1.5 bg-success text-success-foreground border-0 rounded-xl">
                      <Check className="h-3.5 w-3.5" />{t('approve')}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setAction({ id: req.id, approved: false })} className="gap-1.5 rounded-xl">
                      <X className="h-3.5 w-3.5" />{t('reject')}
                    </Button>
                  </div>
                )}

                {/* Approved: Reveal identity button (superadmin only) */}
                {req.status === 'approved' && isSuperadmin && (
                  <div className="space-y-2">
                    {revealedId === req.id && revealedIdentity ? (
                      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-warning/5 border border-warning/20 space-y-1">
                        <p className="text-xs font-bold text-warning flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> আনলকড পরিচয়</p>
                        <p className="text-sm"><span className="text-muted-foreground">নাম:</span> <span className="font-medium">{revealedIdentity.name || '—'}</span></p>
                        <p className="text-sm"><span className="text-muted-foreground">ইমেইল:</span> <span className="font-medium">{revealedIdentity.email || '—'}</span></p>
                        <p className="text-sm"><span className="text-muted-foreground">ফোন:</span> <span className="font-medium">{revealedIdentity.phone || '—'}</span></p>
                        <p className="text-sm"><span className="text-muted-foreground">জেলা:</span> <span className="font-medium">{revealedIdentity.district || '—'}</span></p>
                        <p className="text-sm"><span className="text-muted-foreground">ছদ্মনাম:</span> <span className="font-medium">{revealedIdentity.citizenAlias || '—'}</span></p>
                        <Button size="sm" variant="ghost" onClick={() => { setRevealedId(null); setRevealedIdentity(null); }} className="mt-1 text-xs rounded-lg">
                          <EyeOff className="h-3 w-3 mr-1" /> লুকান
                        </Button>
                      </motion.div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => handleReveal(req.targetUserId, req.id)} disabled={revealing} className="gap-1.5 rounded-xl text-warning border-warning/30">
                        <Eye className="h-3.5 w-3.5" /> পরিচয় দেখুন
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="p-3.5 rounded-xl bg-warning/5 border border-warning/15 flex items-start gap-2.5 text-xs text-muted-foreground">
        <ShieldAlert className="h-4 w-4 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-foreground mb-1">গুরুত্বপূর্ণ নোটিশ</p>
          <p>• পরিচয় আনলক সিদ্ধান্ত অডিট লগে স্বয়ংক্রিয়ভাবে রেকর্ড হয়।</p>
          <p>• শুধুমাত্র উচ্চ আদালতের নির্দেশ বা জরুরি তদন্তের ক্ষেত্রে ব্যবহার করুন।</p>
          <p>• অপব্যবহারের ক্ষেত্রে অ্যাডমিন অ্যাকাউন্ট স্থগিত হতে পারে।</p>
        </div>
      </div>

      <ConfirmModal
        open={!!action}
        onOpenChange={open => !open && setAction(null)}
        title={action?.approved ? 'আনলক অনুমোদন' : 'আনলক প্রত্যাখ্যান'}
        description="এই পরিচয় আনলক সিদ্ধান্ত অডিট লগে রেকর্ড হবে। আপনি কি নিশ্চিত?"
        onConfirm={handleAction}
        destructive={!action?.approved}
        loading={processing}
      />
    </div>
  );
}

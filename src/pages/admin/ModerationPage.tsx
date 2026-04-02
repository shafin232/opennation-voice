import { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Shield, Eye, EyeOff, Check, X, AlertTriangle, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function ModerationPage() {
  const {
    moderationQueue, loading, error, fetchModerationQueue, moderateReport,
    pendingReports, fetchPendingReports, approveReport,
  } = useAdmin();
  const { t } = useLanguage();
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'approve' | 'hide' | 'restore' } | null>(null);
  const [reportAction, setReportAction] = useState<{ id: string; decision: 'approved' | 'rejected' } | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchModerationQueue();
    fetchPendingReports();
  }, [fetchModerationQueue, fetchPendingReports]);

  const handleModerationAction = async () => {
    if (!confirmAction) return;
    setProcessing(true);
    try {
      await moderateReport(confirmAction.id, confirmAction.action);
      toast.success(t('success'));
    } catch { /* handled */ }
    finally { setProcessing(false); setConfirmAction(null); }
  };

  const handleReportDecision = async () => {
    if (!reportAction) return;
    setProcessing(true);
    try {
      await approveReport(reportAction.id, reportAction.decision);
      toast.success(reportAction.decision === 'approved' ? 'রিপোর্ট অনুমোদিত!' : 'রিপোর্ট প্রত্যাখ্যাত!');
    } catch { /* handled */ }
    finally { setProcessing(false); setReportAction(null); }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('moderation')}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">রিপোর্ট পর্যালোচনা ও অনুমোদন</p>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={() => { fetchModerationQueue(); fetchPendingReports(); }} />}

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            অপেক্ষমাণ রিপোর্ট
            {pendingReports.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 min-w-5 text-[10px] px-1.5">{pendingReports.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="flagged" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            ফ্ল্যাগ করা
            {moderationQueue.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-[10px] px-1.5">{moderationQueue.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Pending Reports Tab */}
        <TabsContent value="pending" className="mt-4">
          {loading ? <LoadingSkeleton rows={4} /> : pendingReports.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-success/10 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-success" />
              </div>
              <p className="text-muted-foreground font-medium">কোনো অপেক্ষমাণ রিপোর্ট নেই</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReports.map(report => (
                <Card key={report.id} className="border-border/60 hover:shadow-sm transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <CardTitle className="text-sm leading-snug">{report.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-xs">{report.category}</Badge>
                        <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20">PENDING</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">{report.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>📍 {report.district || 'অনির্ধারিত'}</span>
                      <span>📅 {format(new Date(report.created_at), 'dd/MM/yyyy')}</span>
                      <span>👍 {report.support_count} সমর্থন</span>
                      <span>👎 {report.doubt_count} সন্দেহ</span>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={() => setReportAction({ id: report.id, decision: 'approved' })}
                        className="gap-1.5 gradient-primary border-0"
                      >
                        <Check className="h-3.5 w-3.5" />অনুমোদন
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setReportAction({ id: report.id, decision: 'rejected' })}
                        className="gap-1.5"
                      >
                        <X className="h-3.5 w-3.5" />প্রত্যাখ্যান
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Flagged Reports Tab */}
        <TabsContent value="flagged" className="mt-4">
          {loading ? <LoadingSkeleton rows={4} /> : moderationQueue.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-success/10 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-success" />
              </div>
              <p className="text-muted-foreground font-medium">সব রিপোর্ট পর্যালোচনা সম্পন্ন</p>
            </div>
          ) : (
            <div className="space-y-3">
              {moderationQueue.map(item => (
                <Card key={item.id} className="border-border/60 hover:shadow-sm transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-sm leading-snug">{item.report.title}</CardTitle>
                      <Badge variant="secondary" className="shrink-0 text-xs">{item.report.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.report.description}</p>
                    <div className="flex items-center gap-1.5 text-xs text-destructive bg-destructive/5 rounded-lg px-3 py-2">
                      <AlertTriangle className="h-3.5 w-3.5" />কারণ: {item.flagReason}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" onClick={() => setConfirmAction({ id: item.id, action: 'approve' })} className="gap-1.5 gradient-primary border-0">
                        <Check className="h-3.5 w-3.5" />{t('approve')}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setConfirmAction({ id: item.id, action: 'hide' })} className="gap-1.5">
                        <EyeOff className="h-3.5 w-3.5" />{t('hide')}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setConfirmAction({ id: item.id, action: 'restore' })} className="gap-1.5">
                        <Eye className="h-3.5 w-3.5" />{t('restore')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Moderation Confirm Modal */}
      <ConfirmModal
        open={!!confirmAction}
        onOpenChange={open => !open && setConfirmAction(null)}
        title="নিশ্চিত করুন"
        description={`আপনি কি এই রিপোর্ট ${confirmAction?.action === 'hide' ? 'লুকাতে' : confirmAction?.action === 'approve' ? 'অনুমোদন করতে' : 'পুনরুদ্ধার করতে'} চান?`}
        onConfirm={handleModerationAction}
        destructive={confirmAction?.action === 'hide'}
        loading={processing}
      />

      {/* Report Approval Confirm Modal */}
      <ConfirmModal
        open={!!reportAction}
        onOpenChange={open => !open && setReportAction(null)}
        title="রিপোর্ট সিদ্ধান্ত"
        description={`আপনি কি এই রিপোর্ট ${reportAction?.decision === 'approved' ? 'অনুমোদন' : 'প্রত্যাখ্যান'} করতে চান?`}
        onConfirm={handleReportDecision}
        destructive={reportAction?.decision === 'rejected'}
        loading={processing}
      />
    </div>
  );
}

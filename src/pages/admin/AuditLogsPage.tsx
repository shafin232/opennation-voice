import { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollText, Search } from 'lucide-react';

export default function AuditLogsPage() {
  const { auditLogs, loading, error, fetchAuditLogs } = useAdmin();
  const { t } = useLanguage();
  const [searchAction, setSearchAction] = useState('');

  useEffect(() => { fetchAuditLogs(); }, [fetchAuditLogs]);

  const filtered = searchAction
    ? auditLogs.filter(l => l.action.toLowerCase().includes(searchAction.toLowerCase()))
    : auditLogs;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
            <ScrollText className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('auditLogs')}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">সিস্টেম কার্যক্রম লগ (শুধু পড়ার জন্য)</p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">শুধু পাঠযোগ্য</Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('search')}
          value={searchAction}
          onChange={e => setSearchAction(e.target.value)}
          className="pl-10 h-11 bg-muted/30"
        />
      </div>

      {error && <ErrorBanner message={error} onRetry={() => fetchAuditLogs()} />}

      {loading ? <LoadingSkeleton rows={8} type="table" /> : (
        <div className="rounded-xl border border-border/60 overflow-auto bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="text-xs font-semibold uppercase tracking-wider">কার্যক্রম</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">সম্পাদক</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">ভূমিকা</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">লক্ষ্য</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">সময়</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-12">{t('noData')}</TableCell></TableRow>
              ) : (
                filtered.map(log => (
                  <TableRow key={log.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium text-sm">{log.action}</TableCell>
                    <TableCell className="text-sm">{log.performedBy}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-[10px]">{log.performedByRole}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{log.targetType}:{log.targetId}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(log.timestamp).toLocaleString('bn-BD')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

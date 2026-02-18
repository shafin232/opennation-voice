import { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { Input } from '@/components/ui/input';
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
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-2">
        <ScrollText className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">{t('auditLogs')}</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('search')}
          value={searchAction}
          onChange={e => setSearchAction(e.target.value)}
          className="pl-9"
        />
      </div>

      {error && <ErrorBanner message={error} onRetry={() => fetchAuditLogs()} />}

      {loading ? <LoadingSkeleton rows={8} type="table" /> : (
        <div className="rounded-md border border-border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>কার্যক্রম</TableHead>
                <TableHead>সম্পাদক</TableHead>
                <TableHead>ভূমিকা</TableHead>
                <TableHead>লক্ষ্য</TableHead>
                <TableHead>সময়</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">{t('noData')}</TableCell></TableRow>
              ) : (
                filtered.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium text-sm">{log.action}</TableCell>
                    <TableCell className="text-sm">{log.performedBy}</TableCell>
                    <TableCell className="text-sm">{log.performedByRole}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.targetType}:{log.targetId}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString('bn-BD')}</TableCell>
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

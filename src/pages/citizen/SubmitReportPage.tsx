import { useState } from 'react';
import { useReports } from '@/hooks/useReports';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { toast } from 'sonner';
import type { ReportCategory } from '@/types';

const categories: ReportCategory[] = ['infrastructure', 'corruption', 'health', 'education', 'environment', 'safety', 'governance', 'other'];

export default function SubmitReportPage() {
  const { submitReport, loading, error } = useReports();
  const { t } = useLanguage();
  const { crisisMode } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ReportCategory>('other');
  const [district, setDistrict] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = async () => {
    if (crisisMode.active) return;
    try {
      await submitReport({
        title, description, category,
        location: { district },
        evidence: files.length > 0 ? files : undefined,
      });
      toast.success(t('reportSubmitted'));
      setTitle(''); setDescription(''); setCategory('other'); setDistrict(''); setFiles([]);
    } catch {
      // error handled by hook
    }
  };

  if (crisisMode.active) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive font-medium">{t('crisisNotice')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t('submitReport')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <ErrorBanner message={error} />}

          <div className="space-y-2">
            <Label>{t('reportTitle')}</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>{t('reportDescription')}</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} />
          </div>

          <div className="space-y-2">
            <Label>{t('reportCategory')}</Label>
            <Select value={category} onValueChange={v => setCategory(v as ReportCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c} value={c}>{t(c as any)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('reportLocation')}</Label>
            <Input value={district} onChange={e => setDistrict(e.target.value)} placeholder="জেলা" />
          </div>

          <div className="space-y-2">
            <Label>{t('reportEvidence')}</Label>
            <Input type="file" multiple onChange={e => setFiles(Array.from(e.target.files || []))} />
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={loading || !title.trim() || !description.trim()}>
            {loading ? t('loading') : t('submit')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

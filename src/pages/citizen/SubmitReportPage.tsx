import { useState } from 'react';
import { useReports } from '@/hooks/useReports';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { toast } from 'sonner';
import { FileText, Upload, MapPin, Send, AlertTriangle } from 'lucide-react';
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
    } catch { /* handled */ }
  };

  if (crisisMode.active) {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-destructive font-semibold text-lg">{t('crisisNotice')}</p>
        <p className="text-muted-foreground text-sm mt-2">ক্রাইসিস মোড চলাকালীন জমাদান বন্ধ</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">{t('submitReport')}</CardTitle>
              <CardDescription>আপনার এলাকার সমস্যা রিপোর্ট করুন</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {error && <ErrorBanner message={error} />}

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('reportTitle')}</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} className="h-11 bg-muted/30" placeholder="সংক্ষিপ্ত শিরোনাম" />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('reportDescription')}</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="bg-muted/30 resize-none" placeholder="বিস্তারিত বিবরণ..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('reportCategory')}</Label>
              <Select value={category} onValueChange={v => setCategory(v as ReportCategory)}>
                <SelectTrigger className="h-11 bg-muted/30"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{t(c as any)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('reportLocation')}</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={district} onChange={e => setDistrict(e.target.value)} className="h-11 bg-muted/30 pl-9" placeholder="জেলা" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('reportEvidence')}</Label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/40 transition-colors cursor-pointer" onClick={() => document.getElementById('file-input')?.click()}>
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">ছবি বা ফাইল আপলোড করুন</p>
              {files.length > 0 && <p className="text-xs text-primary mt-1 font-medium">{files.length}টি ফাইল নির্বাচিত</p>}
              <Input id="file-input" type="file" multiple onChange={e => setFiles(Array.from(e.target.files || []))} className="hidden" />
            </div>
          </div>

          <Button className="w-full h-12 text-base font-semibold gap-2 gradient-primary hover:opacity-90 transition-opacity" onClick={handleSubmit} disabled={loading || !title.trim() || !description.trim()}>
            {loading ? t('loading') : <><Send className="h-4 w-4" />{t('submit')}</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

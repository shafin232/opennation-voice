import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { SecureLinkAnimation } from '@/components/shared/SecureLinkAnimation';
import { toast } from 'sonner';
import { FileText, Upload, MapPin, Send, AlertTriangle, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import type { ReportCategory } from '@/types';

const categories: ReportCategory[] = ['infrastructure', 'corruption', 'health', 'education', 'environment', 'safety', 'governance', 'other'];

export default function SubmitReportPage() {
  const { submitReport, loading, error } = useReports();
  const { t } = useLanguage();
  const { crisisMode } = useApp();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ReportCategory>('other');
  const [district, setDistrict] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (crisisMode.active) return;
    try {
      await submitReport({
        title, description, category,
        location: { district },
        evidence: files.length > 0 ? files : undefined,
      });
      setSubmitted(true);
      toast.success(t('reportSubmitted'));
    } catch { /* handled */ }
  };

  if (crisisMode.active) {
    return (
      <div className="text-center py-16 max-w-md mx-auto">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="h-16 w-16 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-destructive font-bengali font-semibold text-lg">{t('crisisNotice')}</p>
          <p className="text-muted-foreground text-sm mt-2 font-bengali">ক্রাইসিস মোড চলাকালীন জমাদান বন্ধ</p>
        </motion.div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
          <div className="h-20 w-20 mx-auto rounded-2xl bg-success/15 flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
        </motion.div>
        <h2 className="text-2xl font-bengali font-bold text-foreground">রিপোর্ট জমা হয়েছে!</h2>
        <SecureLinkAnimation show={true} message="নিরাপদভাবে জমা সম্পন্ন" />
        <Button
          onClick={() => { setSubmitted(false); setStep(0); setTitle(''); setDescription(''); setCategory('other'); setDistrict(''); setFiles([]); }}
          className="mt-4 bg-primary text-primary-foreground font-bengali"
        >
          নতুন রিপোর্ট
        </Button>
      </div>
    );
  }

  const steps = [
    { title: 'বিবরণ', desc: 'রিপোর্টের শিরোনাম ও বিস্তারিত' },
    { title: 'শ্রেণী ও অবস্থান', desc: 'বিভাগ ও এলাকা নির্বাচন' },
    { title: 'প্রমাণ ও জমা', desc: 'ফাইল সংযুক্ত করুন' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
        <Card className="glass-strong border-[hsl(var(--border-subtle))]">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow-teal">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bengali">{t('submitReport')}</CardTitle>
                <CardDescription className="font-bengali">আপনার এলাকার সমস্যা রিপোর্ট করুন</CardDescription>
              </div>
            </div>

            {/* Step indicator */}
            <div className="flex gap-2">
              {steps.map((s, i) => (
                <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground font-bengali">
              ধাপ {step + 1}/{steps.length} — {steps[step].title}
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            {error && <ErrorBanner message={error} />}

            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('reportTitle')}</Label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} className="h-11 bg-muted/20 border-[hsl(var(--border-subtle))]" placeholder="সংক্ষিপ্ত শিরোনাম" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('reportDescription')}</Label>
                    <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={5} className="bg-muted/20 border-[hsl(var(--border-subtle))] resize-none" placeholder="বিস্তারিত বিবরণ..." />
                  </div>
                  <Button onClick={() => setStep(1)} disabled={!title.trim() || !description.trim()} className="w-full h-11 gap-2 bg-primary text-primary-foreground font-bengali">
                    পরবর্তী <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('reportCategory')}</Label>
                    <Select value={category} onValueChange={v => setCategory(v as ReportCategory)}>
                      <SelectTrigger className="h-11 bg-muted/20 border-[hsl(var(--border-subtle))]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories.map(c => <SelectItem key={c} value={c}>{t(c as any)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('reportLocation')}</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input value={district} onChange={e => setDistrict(e.target.value)} className="h-11 bg-muted/20 pl-9 border-[hsl(var(--border-subtle))]" placeholder="জেলা" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(0)} className="flex-1 h-11 gap-2 border-[hsl(var(--border-subtle))] font-bengali">
                      <ArrowLeft className="h-4 w-4" /> পূর্ববর্তী
                    </Button>
                    <Button onClick={() => setStep(2)} className="flex-1 h-11 gap-2 bg-primary text-primary-foreground font-bengali">
                      পরবর্তী <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('reportEvidence')}</Label>
                    <div
                      className="border-2 border-dashed border-[hsl(var(--border-subtle))] rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer glass"
                      onClick={() => document.getElementById('file-input')?.click()}
                    >
                      <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground font-bengali">ছবি বা ফাইল আপলোড করুন</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">ড্র্যাগ অ্যান্ড ড্রপ সমর্থিত</p>
                      {files.length > 0 && <p className="text-xs text-primary mt-2 font-medium font-mono-data">{files.length}টি ফাইল নির্বাচিত</p>}
                      <Input id="file-input" type="file" multiple onChange={e => setFiles(Array.from(e.target.files || []))} className="hidden" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-11 gap-2 border-[hsl(var(--border-subtle))] font-bengali">
                      <ArrowLeft className="h-4 w-4" /> পূর্ববর্তী
                    </Button>
                    <Button
                      className="flex-1 h-12 text-base font-semibold gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-teal font-bengali"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? t('loading') : <><Send className="h-4 w-4" />{t('submit')}</>}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

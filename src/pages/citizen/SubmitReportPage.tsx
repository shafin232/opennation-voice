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
import { FileText, Upload, MapPin, Send, AlertTriangle, ArrowRight, ArrowLeft, CheckCircle, Shield, X, Image, File } from 'lucide-react';
import type { ReportCategory } from '@/types';

const categories: { value: ReportCategory; label: string; emoji: string }[] = [
  { value: 'infrastructure', label: 'অবকাঠামো', emoji: '🏗️' },
  { value: 'corruption', label: 'দুর্নীতি', emoji: '⚖️' },
  { value: 'health', label: 'স্বাস্থ্য', emoji: '🏥' },
  { value: 'education', label: 'শিক্ষা', emoji: '📚' },
  { value: 'environment', label: 'পরিবেশ', emoji: '🌳' },
  { value: 'safety', label: 'নিরাপত্তা', emoji: '🛡️' },
  { value: 'governance', label: 'শাসন', emoji: '🏛️' },
  { value: 'other', label: 'অন্যান্য', emoji: '📋' },
];

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
  const [dragOver, setDragOver] = useState(false);

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

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
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
          <div className="relative inline-block">
            <div className="h-24 w-24 mx-auto rounded-3xl bg-success/15 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-success" />
            </div>
            <motion.div
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Shield className="h-4 w-4 text-primary" />
            </motion.div>
          </div>
        </motion.div>
        <h2 className="text-2xl font-bengali font-bold text-foreground">রিপোর্ট জমা হয়েছে!</h2>
        <p className="text-sm text-muted-foreground font-bengali">AI সত্যতা যাচাই স্বয়ংক্রিয়ভাবে চলছে</p>
        <SecureLinkAnimation show={true} message="নিরাপদভাবে জমা সম্পন্ন" />
        <Button
          onClick={() => { setSubmitted(false); setStep(0); setTitle(''); setDescription(''); setCategory('other'); setDistrict(''); setFiles([]); }}
          className="mt-4 bg-primary text-primary-foreground font-bengali btn-press gap-2"
        >
          <FileText className="h-4 w-4" />
          নতুন রিপোর্ট
        </Button>
      </div>
    );
  }

  const steps = [
    { title: 'বিবরণ', desc: 'রিপোর্টের শিরোনাম ও বিস্তারিত', icon: FileText },
    { title: 'শ্রেণী ও অবস্থান', desc: 'বিভাগ ও এলাকা নির্বাচন', icon: MapPin },
    { title: 'প্রমাণ ও জমা', desc: 'ফাইল সংযুক্ত করুন', icon: Upload },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
        <Card className="glass-strong border-[hsl(var(--border-subtle))] overflow-hidden">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl gradient-primary flex items-center justify-center shadow-glow-teal">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bengali">{t('submitReport')}</CardTitle>
                <CardDescription className="font-bengali">আপনার এলাকার সমস্যা রিপোর্ট করুন</CardDescription>
              </div>
            </div>

            {/* Step indicator — enhanced */}
            <div className="flex gap-1.5">
              {steps.map((s, i) => (
                <div key={i} className="flex-1 space-y-1.5">
                  <div className={`h-1.5 rounded-full transition-all duration-500 ${
                    i < step ? 'bg-success' : i === step ? 'bg-primary' : 'bg-muted'
                  }`} />
                  <div className={`flex items-center gap-1.5 transition-colors ${
                    i <= step ? 'text-foreground' : 'text-muted-foreground/50'
                  }`}>
                    <s.icon className="h-3 w-3" />
                    <span className="text-[10px] font-bengali font-medium">{s.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {error && <ErrorBanner message={error} />}

            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('reportTitle')}</Label>
                    <Input
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="h-12 bg-muted/20 border-[hsl(var(--border-subtle))] text-base"
                      placeholder="সংক্ষিপ্ত শিরোনাম"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('reportDescription')}</Label>
                    <Textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      rows={6}
                      className="bg-muted/20 border-[hsl(var(--border-subtle))] resize-none text-sm leading-relaxed"
                      placeholder="বিস্তারিত বিবরণ লিখুন..."
                    />
                    <p className="text-[10px] text-muted-foreground/60 text-right font-mono-data">{description.length} অক্ষর</p>
                  </div>
                  <Button onClick={() => setStep(1)} disabled={!title.trim() || !description.trim()} className="w-full h-12 gap-2 bg-primary text-primary-foreground font-bengali btn-press text-base">
                    পরবর্তী <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('reportCategory')}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map(c => (
                        <button
                          key={c.value}
                          onClick={() => setCategory(c.value)}
                          className={`p-3 rounded-xl border text-left transition-all btn-press ${
                            category === c.value
                              ? 'border-primary bg-primary/10 shadow-glow-teal'
                              : 'border-[hsl(var(--border-subtle))] bg-muted/10 hover:border-primary/30'
                          }`}
                        >
                          <span className="text-lg">{c.emoji}</span>
                          <p className={`text-xs font-bengali font-medium mt-1 ${category === c.value ? 'text-primary' : 'text-foreground'}`}>{c.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('reportLocation')}</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input value={district} onChange={e => setDistrict(e.target.value)} className="h-12 bg-muted/20 pl-10 border-[hsl(var(--border-subtle))] text-base" placeholder="জেলার নাম" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(0)} className="flex-1 h-12 gap-2 border-[hsl(var(--border-subtle))] font-bengali btn-press">
                      <ArrowLeft className="h-4 w-4" /> পূর্ববর্তী
                    </Button>
                    <Button onClick={() => setStep(2)} className="flex-1 h-12 gap-2 bg-primary text-primary-foreground font-bengali btn-press">
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
                      className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                        dragOver ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-[hsl(var(--border-subtle))] hover:border-primary/40 glass'
                      }`}
                      onClick={() => document.getElementById('file-input')?.click()}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                    >
                      <motion.div
                        animate={dragOver ? { scale: 1.1 } : { scale: 1 }}
                        className="h-14 w-14 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-3"
                      >
                        <Upload className={`h-7 w-7 ${dragOver ? 'text-primary' : 'text-muted-foreground'}`} />
                      </motion.div>
                      <p className="text-sm text-muted-foreground font-bengali font-medium">ছবি বা ফাইল আপলোড করুন</p>
                      <p className="text-[10px] text-muted-foreground/50 mt-1">ড্র্যাগ অ্যান্ড ড্রপ অথবা ক্লিক করুন</p>
                      <Input id="file-input" type="file" multiple onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files || [])])} className="hidden" accept="image/*,video/*,.pdf,.doc,.docx" />
                    </div>

                    {/* File list */}
                    {files.length > 0 && (
                      <div className="space-y-2 mt-3">
                        {files.map((file, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20 border border-[hsl(var(--border-subtle))]"
                          >
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              {file.type.startsWith('image') ? <Image className="h-4 w-4 text-primary" /> : <File className="h-4 w-4 text-primary" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{file.name}</p>
                              <p className="text-[10px] text-muted-foreground font-mono-data">{(file.size / 1024).toFixed(0)} KB</p>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="h-6 w-6 rounded-md hover:bg-destructive/10 flex items-center justify-center transition-colors">
                              <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12 gap-2 border-[hsl(var(--border-subtle))] font-bengali btn-press">
                      <ArrowLeft className="h-4 w-4" /> পূর্ববর্তী
                    </Button>
                    <Button
                      className="flex-1 h-12 text-base font-semibold gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-teal font-bengali btn-press"
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

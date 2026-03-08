import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, User2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const DISTRICTS = [
  'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'সিলেট', 'বরিশাল', 'রংপুর', 'ময়মনসিংহ',
  'কুমিল্লা', 'গাজীপুর', 'নারায়ণগঞ্জ', 'টাঙ্গাইল', 'বগুড়া', 'দিনাজপুর', 'যশোর',
];

export default function ProfileEditPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [district, setDistrict] = useState(user?.district || '');

  if (!user) return null;

  const handleSave = async () => {
    setSaving(true);
    console.log('[ProfileEdit] Saving profile for', user.id);
    const { error } = await supabase
      .from('profiles')
      .update({ name, phone, district })
      .eq('user_id', user.id);

    if (error) {
      toast.error('প্রোফাইল আপডেট ব্যর্থ');
    } else {
      toast.success('প্রোফাইল আপডেট হয়েছে!');
      // Reload the page to refresh auth context
      window.location.href = '/app/profile';
    }
    setSaving(false);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/app/profile')} className="gap-2 mb-4 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> ফিরে যান
        </Button>

        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">প্রোফাইল এডিট করুন</h1>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">নাম</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="আপনার নাম" className="rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">ফোন নম্বর</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX" className="rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">জেলা</Label>
              <Select value={district} onValueChange={setDistrict}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="জেলা নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {DISTRICTS.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="w-full mt-6 h-11 rounded-xl bg-primary text-primary-foreground gap-2 font-semibold"
          >
            <Save className="h-4 w-4" />
            {saving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

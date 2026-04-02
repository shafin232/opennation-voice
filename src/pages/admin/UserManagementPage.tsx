import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Users, Shield, Search, UserCog, UserPlus, Loader2 } from 'lucide-react';
import type { UserRole } from '@/types';

interface ProfileWithRole {
  user_id: string;
  name: string;
  email: string | null;
  district: string;
  trust_score: number;
  created_at: string;
  role: UserRole;
}

const ROLE_COLORS: Record<UserRole, string> = {
  citizen: 'bg-muted text-muted-foreground',
  moderator: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  admin: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  superadmin: 'bg-destructive/15 text-destructive border-destructive/30',
};

const ROLE_LABELS: Record<UserRole, string> = {
  citizen: 'নাগরিক',
  moderator: 'মডারেটর',
  admin: 'অ্যাডমিন',
  superadmin: 'সুপার অ্যাডমিন',
};

export default function UserManagementPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('admin');

  const isSuperadmin = user?.role === 'superadmin';

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('user_id, name, email, district, trust_score, created_at')
        .order('created_at', { ascending: false });

      if (pErr) throw pErr;

      const { data: roles, error: rErr } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rErr) throw rErr;

      const roleMap = new Map<string, UserRole>();
      roles?.forEach((r) => roleMap.set(r.user_id, r.role as UserRole));

      return (profiles || []).map((p) => ({
        ...p,
        role: roleMap.get(p.user_id) || 'citizen',
      })) as ProfileWithRole[];
    },
    enabled: isSuperadmin,
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: UserRole }) => {
      const { error: delErr } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      if (delErr) throw delErr;

      const { error: insErr } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole as any });
      if (insErr) throw insErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Role আপডেট হয়েছে');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Role আপডেট ব্যর্থ');
    },
  });

  const inviteUser = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: {
          email: newEmail,
          password: newPassword,
          name: newName,
          district: newDistrict,
          role: newRole,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('নতুন ইউজার যোগ হয়েছে!');
      setDialogOpen(false);
      setNewEmail('');
      setNewPassword('');
      setNewName('');
      setNewDistrict('');
      setNewRole('admin');
    },
    onError: (err: any) => {
      toast.error(err.message || 'ইউজার যোগ করা ব্যর্থ');
    },
  });

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.district?.toLowerCase().includes(search.toLowerCase())
  );

  if (!isSuperadmin) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="max-w-md w-full border-destructive/30">
          <CardContent className="pt-8 text-center">
            <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold font-bengali mb-2">অ্যাক্সেস নেই</h2>
            <p className="text-muted-foreground font-bengali text-sm">
              শুধুমাত্র সুপার অ্যাডমিন এই পেজ দেখতে পারবে।
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <UserCog className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-bengali text-foreground">ইউজার ম্যানেজমেন্ট</h1>
            <p className="text-xs text-muted-foreground font-bengali">
              মোট {users.length} জন ইউজার
            </p>
          </div>
        </div>

        {/* Add User Button */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-bengali gap-2" size="sm">
              <UserPlus className="h-4 w-4" />
              নতুন ইউজার যোগ করুন
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-bengali">নতুন ইউজার তৈরি করুন</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                inviteUser.mutate();
              }}
              className="space-y-4 pt-2"
            >
              <div className="space-y-2">
                <Label className="font-bengali text-xs">নাম</Label>
                <Input
                  placeholder="ইউজারের নাম"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="font-bengali"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bengali text-xs">ইমেইল *</Label>
                <Input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bengali text-xs">পাসওয়ার্ড *</Label>
                <Input
                  type="password"
                  required
                  minLength={6}
                  placeholder="ন্যূনতম ৬ অক্ষর"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="font-bengali"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bengali text-xs">জেলা</Label>
                <Input
                  placeholder="যেমন: ঢাকা"
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  className="font-bengali"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bengali text-xs">Role *</Label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
                  <SelectTrigger className="font-bengali text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="citizen" className="font-bengali">নাগরিক</SelectItem>
                    <SelectItem value="moderator" className="font-bengali">মডারেটর</SelectItem>
                    <SelectItem value="admin" className="font-bengali">অ্যাডমিন</SelectItem>
                    <SelectItem value="superadmin" className="font-bengali">সুপার অ্যাডমিন</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                className="w-full font-bengali gap-2"
                disabled={inviteUser.isPending}
              >
                {inviteUser.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                ইউজার তৈরি করুন
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="নাম, ইমেইল বা জেলা দিয়ে খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 font-bengali"
        />
      </div>

      {/* User List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-bengali">কোনো ইউজার পাওয়া যায়নি</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <Card key={u.user_id} className="border-border/40 hover:border-border/60 transition-colors">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">
                      {u.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate font-bengali">
                      {u.name || 'নামহীন'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {u.email || 'ইমেইল নেই'}
                    </p>
                    {u.district && (
                      <p className="text-[10px] text-muted-foreground/70 font-bengali">
                        {u.district}
                      </p>
                    )}
                  </div>
                </div>

                <Badge variant="outline" className={`shrink-0 font-bengali text-[11px] ${ROLE_COLORS[u.role]}`}>
                  {ROLE_LABELS[u.role]}
                </Badge>

                {u.user_id !== user?.id ? (
                  <Select
                    value={u.role}
                    onValueChange={(val) =>
                      updateRole.mutate({ userId: u.user_id, newRole: val as UserRole })
                    }
                  >
                    <SelectTrigger className="w-[140px] shrink-0 text-xs font-bengali">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="citizen" className="font-bengali text-xs">নাগরিক</SelectItem>
                      <SelectItem value="moderator" className="font-bengali text-xs">মডারেটর</SelectItem>
                      <SelectItem value="admin" className="font-bengali text-xs">অ্যাডমিন</SelectItem>
                      <SelectItem value="superadmin" className="font-bengali text-xs">সুপার অ্যাডমিন</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-[10px] text-muted-foreground font-bengali shrink-0">আপনি</span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

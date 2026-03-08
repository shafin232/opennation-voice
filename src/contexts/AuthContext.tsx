import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, AuthState, UserRole } from '@/types';

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, meta?: { name?: string; district?: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchProfile(userId: string): Promise<User | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  const { data: roles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);

  if (!profile) return null;

  const role: UserRole = (roles?.[0]?.role as UserRole) ?? 'citizen';

  return {
    id: userId,
    name: profile.name || '',
    phone: profile.phone || '',
    email: profile.email || '',
    role,
    district: profile.district || '',
    trustScore: profile.trust_score ?? 50,
    truthScore: profile.truth_score ?? 50,
    avatar: profile.avatar_url || undefined,
    language: (profile.language as 'bn' | 'en') || 'bn',
    createdAt: profile.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Use setTimeout to avoid Supabase deadlock
        setTimeout(async () => {
          const user = await fetchProfile(session.user.id);
          setState({
            user,
            token: session.access_token,
            isAuthenticated: true,
            loading: false,
          });
        }, 0);
      } else {
        setState({ user: null, token: null, isAuthenticated: false, loading: false });
      }
    });

    // THEN check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const user = await fetchProfile(session.user.id);
        setState({
          user,
          token: session.access_token,
          isAuthenticated: true,
          loading: false,
        });
      } else {
        setState(s => ({ ...s, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string, meta?: { name?: string; district?: string }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: meta?.name || '', district: meta?.district || '' },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ user: null, token: null, isAuthenticated: false, loading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signUp, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

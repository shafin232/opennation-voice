import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import apiClient from '@/lib/apiClient';
import type { User, AuthState, AuthResponse } from '@/types';

interface AuthContextType extends AuthState {
  sendOTP: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
  });

  // Hydrate from localStorage
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    if (token && userStr) {
      try {
        const user: User = JSON.parse(userStr);
        setState({ user, token, isAuthenticated: true, loading: false });
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setState(s => ({ ...s, loading: false }));
      }
    } else {
      setState(s => ({ ...s, loading: false }));
    }
  }, []);

  const sendOTP = useCallback(async (phone: string) => {
    await apiClient.post('/auth/otp/send', { phone });
  }, []);

  const verifyOTP = useCallback(async (phone: string, otp: string) => {
    const { data } = await apiClient.post<AuthResponse>('/auth/otp/verify', { phone, otp });
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    setState({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setState({ user: null, token: null, isAuthenticated: false, loading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, sendOTP, verifyOTP, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

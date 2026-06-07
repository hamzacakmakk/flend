// ==========================================================================
// lib/auth/AuthContext.tsx — Oturum durumu (token + kullanıcı) paylaşımı
// ==========================================================================
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { loadToken, saveToken, clearToken } from './tokenStore';
import { loadApiBaseUrl } from '../config';
import { login as apiLogin, register as apiRegister, getProfile } from '../api/auth';
import { httpGet } from '../http';
import type { User, RegisterInput } from '../api';

interface AuthState {
  ready: boolean;            // secure-store okundu mu
  token: string | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthCtx = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      await loadApiBaseUrl();   // kayıtlı sunucu adresini token'dan önce yükle
      const t = await loadToken();
      setToken(t);
      if (t) {
        try {
          // Kısa timeout: backend erişilemezse hızlıca login'e düş
          setUser(await httpGet<User>('/api/users/profile', { timeoutMs: 5000 }));
        } catch {
          await clearToken();
          setToken(null);
        }
      }
      setReady(true);
    })();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await apiLogin({ email, password });
    await saveToken(res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const signUp = useCallback(async (input: RegisterInput) => {
    const res = await apiRegister(input);
    await saveToken(res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const signOut = useCallback(async () => {
    await clearToken();
    setToken(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      setUser(await getProfile());
    } catch {
      /* yoksay */
    }
  }, []);

  return (
    <AuthCtx.Provider value={{ ready, token, user, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth, AuthProvider içinde kullanılmalı');
  return ctx;
}

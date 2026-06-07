// ==========================================================================
// lib/api/auth.ts — Tufan (1-6) — kayıt, giriş, profil, abonelik
// ==========================================================================
import { httpGet, httpPost, httpPut, httpDelete } from '../http';
import type { AuthResponse, User, SubscriptionPackage } from './types';

export interface RegisterInput {
  email: string;
  password: string;
  fullName?: string;
  companyName?: string;
  phone?: string;
}

// 1. POST /api/auth/register
export function register(input: RegisterInput): Promise<AuthResponse> {
  return httpPost<AuthResponse>('/api/auth/register', input, { auth: false });
}

// 2. POST /api/auth/login
export function login(input: { email: string; password: string }): Promise<AuthResponse> {
  return httpPost<AuthResponse>('/api/auth/login', input, { auth: false });
}

// 3. GET /api/users/profile
export function getProfile(): Promise<User> {
  return httpGet<User>('/api/users/profile');
}

// 4. PUT /api/users/profile
export function updateProfile(input: {
  fullName?: string;
  companyName?: string;
  phone?: string;
  password?: string;
}): Promise<User> {
  return httpPut<User>('/api/users/profile', input);
}

// 5. DELETE /api/users/account — dondur (hard=true ile kalıcı sil)
export function deleteAccount(hard = false): Promise<{ message: string }> {
  return httpDelete<{ message: string }>(`/api/users/account${hard ? '?hard=true' : ''}`);
}

// 6. GET /api/subscriptions/plans
export function getSubscriptionPlans(): Promise<SubscriptionPackage[]> {
  return httpGet<SubscriptionPackage[]>('/api/subscriptions/plans', { auth: false });
}

// ==========================================================================
// lib/theme.ts — Tek yerden renk paleti + ölçüler (mevcut ekran stilinden)
// Yeni ekranlar buradan okur; mevcut bileşenler aynen çalışmaya devam eder.
// ==========================================================================
export const colors = {
  bg: '#f8fafc',
  surface: '#ffffff',
  surfaceAlt: '#eef2ff',
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  accent: '#a855f7',
  success: '#10b981',
  successBg: '#dcfce7',
  warning: '#f59e0b',
  warningBg: '#fef3c7',
  danger: '#ef4444',
  dangerBg: '#fee2e2',
  text: '#0f172a',
  muted: '#64748b',
  faint: '#94a3b8',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
} as const;

export const radius = {
  pill: 20,
  card: 18,
  modal: 24,
  sheet: 28,
  input: 12,
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 } as const;

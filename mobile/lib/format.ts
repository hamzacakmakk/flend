// ==========================================================================
// lib/format.ts — Biçimlendirme yardımcıları
// NUMERIC alanlar API'den string gelebilir → Number() ile güvenli sarmalama.
// ==========================================================================
export function formatTRY(value: number | string | null | undefined): string {
  const n = Number(value);
  if (value == null || Number.isNaN(n)) return '—';
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
}

export function formatNumber(value: number | string | null | undefined): string {
  const n = Number(value);
  if (value == null || Number.isNaN(n)) return '—';
  return n.toLocaleString('tr-TR');
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return '';
  const diff = Date.now() - d;
  const min = Math.round(diff / 60000);
  if (min < 1) return 'az önce';
  if (min < 60) return `${min} dk önce`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} sa önce`;
  const day = Math.round(hr / 24);
  return `${day} gün önce`;
}

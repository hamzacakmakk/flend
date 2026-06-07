// ==========================================================================
// lib/http.ts — Tek fetch sarmalayıcı
// Base URL + Authorization (Bearer) enjeksiyonu + timeout + JSON + hata yönetimi.
// ==========================================================================
import { API_BASE_URL } from './config';
import { getToken, clearToken } from './auth/tokenStore';

interface HttpOptions extends RequestInit {
  timeoutMs?: number;
  auth?: boolean; // false → Authorization header gönderme
}

export async function http<T = unknown>(path: string, opts: HttpOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 30000);
  const token = opts.auth === false ? null : getToken();

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...opts,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opts.headers ?? {}),
      },
    });

    if (res.status === 401) {
      await clearToken();
      throw new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
    }

    if (!res.ok) {
      let message = `İstek başarısız (${res.status})`;
      try {
        const body = await res.json();
        if (body?.error) message = body.error;
      } catch {
        // gövde JSON değil
      }
      throw new Error(message);
    }

    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } catch (err: any) {
    if (err?.name === 'AbortError') throw new Error('İstek zaman aşımına uğradı');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// Kısayollar
export const httpGet = <T>(path: string, opts?: HttpOptions) => http<T>(path, { ...opts, method: 'GET' });
export const httpPost = <T>(path: string, body?: unknown, opts?: HttpOptions) =>
  http<T>(path, { ...opts, method: 'POST', body: body != null ? JSON.stringify(body) : undefined });
export const httpPut = <T>(path: string, body?: unknown, opts?: HttpOptions) =>
  http<T>(path, { ...opts, method: 'PUT', body: body != null ? JSON.stringify(body) : undefined });
export const httpDelete = <T>(path: string, opts?: HttpOptions) => http<T>(path, { ...opts, method: 'DELETE' });

// ==========================================================================
// middleware/auth.js — JWT üretimi + doğrulama
//
//  signToken(userId)  → JWT (login/register sonrası)
//  requireAuth        → Bearer zorunlu (kişisel hesap endpoint'leri)
//  resolveUser        → Bearer varsa kullanır, yoksa DEMO_USER_ID fallback
//                       (mevcut controller'lar implicit user_id ile çalışıyordu;
//                        demo'nun token'sız da çalışması için).
// ==========================================================================
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'flend-dev-secret-change-me';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';
export const DEMO_USER_ID =
  process.env.DEMO_USER_ID || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

export function signToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function readBearer(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
}

// Zorunlu kimlik doğrulama — token yok/geçersiz → 401
export function requireAuth(req, res, next) {
  const token = readBearer(req);
  if (!token) return res.status(401).json({ error: 'Yetkilendirme gerekli (token yok)' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub };
    next();
  } catch {
    res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token' });
  }
}

// Yumuşak kimlik doğrulama — token varsa kullan, yoksa demo kullanıcı
export function resolveUser(req, res, next) {
  const token = readBearer(req);
  if (!token) {
    req.user = { id: DEMO_USER_ID };
    return next();
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub };
    next();
  } catch {
    // Geçersiz token gönderildiyse net hata ver
    res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token' });
  }
}

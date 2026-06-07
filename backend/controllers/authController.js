// ==========================================================================
// controllers/authController.js — Tufan Akbaş (Gereksinim 1-6)
// Kayıt, giriş (JWT), profil görüntüle/güncelle, hesap dondur, abonelik paketleri.
// ==========================================================================
import bcrypt from 'bcryptjs';
import { query } from '../db/pool.js';
import { signToken } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { cachedQuery } from '../infra/redis.js';

const FREE_PACKAGE_ID = 'c0000000-0000-4000-8000-000000000001';

// Parola alanını gizleyerek kullanıcı satırını döndür
function publicUser(row) {
  if (!row) return null;
  const { password_hash, ...rest } = row;
  return rest;
}

// Profili abonelik paketi bilgisiyle birlikte çek
async function fetchProfile(userId) {
  const { rows } = await query(
    `SELECT u.*,
            p.name   AS package_name,
            p.price  AS package_price,
            p.period AS package_period
       FROM users u
       LEFT JOIN subscription_packages p ON p.id = u.subscription_package_id
      WHERE u.id = $1`,
    [userId]
  );
  return rows[0] || null;
}

// 1. POST /api/auth/register — Yeni satıcı hesabı oluşturma
export async function register(req, res, next) {
  try {
    const { email, password, fullName, companyName, phone } = req.body || {};
    if (!email || !password) throw new AppError('email ve password zorunludur', 400);
    if (String(password).length < 6) throw new AppError('Parola en az 6 karakter olmalıdır', 400);

    const exists = await query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (exists.rowCount > 0) throw new AppError('Bu e-posta zaten kayıtlı', 409);

    const password_hash = await bcrypt.hash(String(password), 10);
    const { rows } = await query(
      `INSERT INTO users (email, password_hash, full_name, company_name, phone, subscription_package_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'active')
       RETURNING *`,
      [email, password_hash, fullName || null, companyName || null, phone || null, FREE_PACKAGE_ID]
    );

    const token = signToken(rows[0].id);
    res.status(201).json({ token, user: publicUser(rows[0]) });
  } catch (err) {
    next(err);
  }
}

// 2. POST /api/auth/login — Giriş + JWT üretimi
export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) throw new AppError('email ve password zorunludur', 400);

    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user) throw new AppError('E-posta veya parola hatalı', 401);
    if (user.status === 'deleted') throw new AppError('Bu hesap silinmiş', 403);

    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) throw new AppError('E-posta veya parola hatalı', 401);

    const token = signToken(user.id);
    res.status(200).json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

// 3. GET /api/users/profile — Profil + abonelik (requireAuth)
export async function getProfile(req, res, next) {
  try {
    const row = await fetchProfile(req.user.id);
    if (!row) throw new AppError('Kullanıcı bulunamadı', 404);
    res.status(200).json(publicUser(row));
  } catch (err) {
    next(err);
  }
}

// 4. PUT /api/users/profile — Profil/şifre güncelleme (requireAuth)
export async function updateProfile(req, res, next) {
  try {
    const { fullName, companyName, phone, password } = req.body || {};

    const fields = [];
    const params = [];
    let i = 1;
    if (fullName !== undefined)    { fields.push(`full_name = $${i++}`);    params.push(fullName); }
    if (companyName !== undefined) { fields.push(`company_name = $${i++}`); params.push(companyName); }
    if (phone !== undefined)       { fields.push(`phone = $${i++}`);        params.push(phone); }
    if (password) {
      if (String(password).length < 6) throw new AppError('Parola en az 6 karakter olmalıdır', 400);
      fields.push(`password_hash = $${i++}`);
      params.push(await bcrypt.hash(String(password), 10));
    }
    if (fields.length === 0) throw new AppError('Güncellenecek alan yok', 400);

    fields.push(`updated_at = now()`);
    params.push(req.user.id);
    const { rows } = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      params
    );
    if (rows.length === 0) throw new AppError('Kullanıcı bulunamadı', 404);
    res.status(200).json(publicUser(rows[0]));
  } catch (err) {
    next(err);
  }
}

// 5. DELETE /api/users/account — Hesabı dondurma/silme (requireAuth)
export async function deleteAccount(req, res, next) {
  try {
    // Güvenli varsayılan: dondur (status='frozen'). ?hard=true ile kalıcı sil.
    const hard = String(req.query.hard || '').toLowerCase() === 'true';
    if (hard) {
      await query('DELETE FROM users WHERE id = $1', [req.user.id]);
      return res.status(200).json({ message: 'Hesap kalıcı olarak silindi' });
    }
    const { rows } = await query(
      `UPDATE users SET status = 'frozen', updated_at = now() WHERE id = $1 RETURNING id, status`,
      [req.user.id]
    );
    if (rows.length === 0) throw new AppError('Kullanıcı bulunamadı', 404);
    res.status(200).json({ message: 'Hesap donduruldu', status: rows[0].status });
  } catch (err) {
    next(err);
  }
}

// 6. GET /api/subscriptions/plans — SaaS abonelik paketleri (auth'suz, Redis cache)
export async function listPackages(req, res, next) {
  try {
    const data = await cachedQuery('subscription_packages', async () => {
      const { rows } = await query('SELECT * FROM subscription_packages ORDER BY price ASC');
      return rows;
    });
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
}

// Boot'ta demo kullanıcının parolasını gerçek bcrypt('demo1234') yapar (idempotent).
export async function ensureDemoUser() {
  try {
    const demoEmail = 'demo@flend.com';
    const hash = await bcrypt.hash('demo1234', 10);
    const { rowCount } = await query(
      `UPDATE users SET password_hash = $1
        WHERE email = $2 AND (password_hash = 'SET_ON_BOOT' OR password_hash IS NULL)`,
      [hash, demoEmail]
    );
    if (rowCount > 0) console.log('🔑 Demo kullanıcı parolası ayarlandı (demo@flend.com / demo1234)');
  } catch (err) {
    console.warn('⚠️  ensureDemoUser atlandı:', err.message);
  }
}

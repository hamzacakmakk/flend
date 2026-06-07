// ============================================
// Bearer Token kimlik doğrulama
// Mobil istemci her isteğe "Authorization: Bearer <token>" başlığı ekler.
// MOBILE_API_TOKEN boşsa (geliştirme) doğrulama atlanır.
// ============================================

const { AppError } = require('./errorHandler');

const requireAuth = (req, res, next) => {
  const expected = process.env.MOBILE_API_TOKEN;

  // Token tanımlı değilse geliştirme modunda serbest bırak
  if (!expected) return next();

  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new AppError('Yetkilendirme başlığı eksik veya hatalı', 401));
  }

  if (token !== expected) {
    return next(new AppError('Geçersiz token', 401));
  }

  next();
};

module.exports = { requireAuth };

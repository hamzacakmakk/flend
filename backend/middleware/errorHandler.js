// ==========================================================================
// middleware/errorHandler.js — Merkezi hata yönetimi
// (Mehmet-Tasci/Flend/api/src/middleware/errorHandler.js deseninden ESM'e)
// ==========================================================================

export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// Express 5 async route'larından fırlatılan hatalar buraya düşer.
export function errorHandler(err, req, res, _next) {
  const status = err.statusCode || 500;
  if (status >= 500) {
    console.error('❌ [API] Sunucu hatası:', err.message);
  }
  res.status(status).json({ error: err.message || 'Beklenmeyen bir hata oluştu' });
}

// 404 — tanımsız route
export function notFound(req, res) {
  res.status(404).json({ error: `Kaynak bulunamadı: ${req.method} ${req.originalUrl}` });
}

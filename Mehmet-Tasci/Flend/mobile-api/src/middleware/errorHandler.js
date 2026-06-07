// ============================================
// Ortak hata yönetimi - mobil istemci tutarlı JSON bekler
// ============================================

class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const errorHandler = (err, req, res, next) => {
  console.error('🔥 Hata:', err.message);

  const statusCode = err.status || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Sunucu içi hata oluştu',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorHandler, AppError };

# ============================================
# Flend Mobil Backend - Dockerfile
# Express API + Sync Worker (RabbitMQ/Redis kuyruğu)
# ============================================
# node:22 — @supabase/supabase-js global WebSocket gerektirir; bu Node 22+'da yerel gelir.
# (node:20'de "Supabase is not initialized: ...native WebSocket support" hatası oluşuyordu.)
FROM node:22-alpine

# Uygulama dizini
WORKDIR /app

# Sağlık kontrolü için curl
RUN apk add --no-cache curl

# Önce sadece bağımlılık dosyalarını kopyala (Docker layer cache için).
# package*.json değişmediği sürece npm ci adımı yeniden çalışmaz.
COPY package*.json ./

# Üretim bağımlılıklarını kur (lockfile ile birebir, tekrarlanabilir kurulum)
RUN npm ci --omit=dev

# Uygulama kaynak kodunu kopyala
COPY . .

# Konteyner içinde root yerine ayrıcalıksız kullanıcıyla çalış (güvenlik)
USER node

# API portu
EXPOSE 5001

# Konteyner sağlığı: /api/health 200 dönüyor mu?
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -fsS http://localhost:5001/api/health || exit 1

# Varsayılan komut: API sunucusu (worker'ı docker-compose ayrı servis olarak çalıştırır)
CMD ["node", "src/app.js"]

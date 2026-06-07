# ── Flend Backend — Docker image ─────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Bağımlılıklar (lock varsa ci, yoksa install)
COPY package*.json ./
RUN npm install --omit=dev

# Uygulama kodu
COPY . .

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

# Varsayılan: API. worker / kafka-consumer için compose'ta command override edilir.
CMD ["node", "index.js"]

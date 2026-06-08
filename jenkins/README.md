# Flend — Jenkins CI/CD (Docker)

Docker'da çalışan Jenkins controller'ı + kök dizindeki `Jenkinsfile` ile
**CI + local CD** pipeline'ı.

## Pipeline aşamaları
1. **Checkout** — repo'yu çeker.
2. **Backend: Install & Test** — `npm ci`/`install` + `npm test` (syntax kontrolü).
3. **Build Images** — `docker compose --profile full build`.
4. **Deploy (local)** — `docker-compose.yml` + `docker-compose.ci.yml` ile bu makineye
   `up -d` (app stack'iyle aynı `flend` projesi → mevcut veriler korunur).
5. **Smoke Test** — `http://host.docker.internal:5000/health` 200 bekler.

## Kurulum

```bash
# 1) Jenkins'i başlat (bu klasörden)
cd jenkins
docker compose up -d --build

# 2) İlk admin parolası
docker exec flend_jenkins cat /var/jenkins_home/secrets/initialAdminPassword
#  (Git Bash yolu bozarsa:  MSYS_NO_PATHCONV=1 docker exec ... )

# 3) Arayüz
#    http://localhost:8080  → parolayı gir → "Install suggested plugins" → admin kullanıcı oluştur
```

## Pipeline job'ı oluşturma (arayüzde)
1. **New Item** → ad: `flend` → tür: **Pipeline** → OK.
2. **Pipeline** bölümü → Definition: **Pipeline script from SCM**.
3. SCM: **Git**, Repository URL: `https://github.com/hamzacakmakk/flend.git`
   (özel repo ise Credentials ekle), Branch: `*/main` (veya kullanılan dal).
4. **Script Path:** `Jenkinsfile` → Save.
5. **Build Now** ile çalıştır. Poll SCM (`H/5 * * * *`) zaten tanımlı; 5 dk'da bir
   değişiklik kontrol eder.

## Notlar / gereksinimler
- **Docker Desktop** açık olmalı; Jenkins host'un `docker.sock`'una bağlanır
  (`//var/run/docker.sock`) ve `user: root` ile çalışır.
- `HOST_FLEND_DIR` (bu klasördeki `.env`) projenin HOST mutlak yolu olmalı; makine
  değişirse güncelleyin. `docker-compose.ci.yml` Postgres init mount'larında kullanır.
- `COMPOSE_PROJECT_NAME=flend` sabit → Jenkins, elle başlattığınız stack'le **aynı**
  container/volume'ları yönetir (çift stack oluşmaz, `pg_data` korunur).
- Smoke test `host.docker.internal` kullanır (Docker Desktop'ta host'a erişim).

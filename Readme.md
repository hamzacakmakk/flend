# Flend

Roseware

---


![Ürün Tanıtım Görseli](Product.png)


## Proje Hakkında

**Proje Tanımı:** 
Flend; e-ticaret pazaryerlerinde (Trendyol, Hepsiburada, Amazon vb.) satış yapan firmalar için otomatik bir rekabet ve kâr optimizasyonu asistanıdır. Satıcıların kendi ürünlerinin linkini ve rakip linklerini girmesiyle sistem arka planda 7/24 güncel fiyat, stok durumu ve mağaza puanı çeken B2B SaaS yapısıdır. Kullanıcının belirlediği kurallara göre (Örn: "Rakip benden ucuzsa fiyatımı ondan 1 TL aşağı çek ama maliyet altına inme") pazaryerine API üzerinden yeni optimum fiyat gönderir ve fırsat bulduğunda kâr marjını artırmak için fiyatı yükseltir.

**Proje Kategorisi:** 
E-Ticaret / B2B SaaS


---

## Proje Linkleri

- **REST API Adresi:** [api.flend.com](https://api.flend.com)
- **Web Frontend Adresi:** [frontend.flend.com](https://frontend.flend.com)

---

## Proje Ekibi

**Grup Adı:** 
Roseware

**Ekip Üyeleri:** 
- Tufan Akbaş
- Mehmet Taşcı
- Muhammed Hamza Çakmak
- Kadir Cihan Kığılcım
- Nurullah Turgut

---

## Dokümantasyon

Proje dokümantasyonuna aşağıdaki linklerden erişebilirsiniz:

1. [Gereksinim Analizi](Gereksinim-Analizi.md)
2. [REST API Tasarımı](API-Tasarimi.md)
3. [REST API](Rest-API.md)
4. [Web Front-End](WebFrontEnd.md)
5. [Mobil Front-End](MobilFrontEnd.md)
6. [Mobil Backend](MobilBackEnd.md)
7. [Video Sunum](Sunum.md)

---

## Tek Ürün — Mimari

Proje, 30 gereksinimin tamamını kapsayan **tek bir mobil uygulama** ile bunu besleyen **tek bir birleşik REST API**'den oluşur:

```
flend/
├── backend/   → Birleşik REST API (Express + PostgreSQL + Redis + RabbitMQ + Kafka)
├── mobile/    → Birleşik mobil uygulama (React Native / Expo Router, SDK 56)
└── <üye>/     → Üyelerin bireysel web frontend çalışmaları + görev dokümanları
```

## Kurulum ve Çalıştırma (Yerel Demo)

> Gereksinimler: Docker Desktop, Node.js 20+, (mobil için) Expo Go uygulaması veya bir emülatör.

**1) Altyapı + veritabanı** (repo kökünde) — şema ve demo veri otomatik yüklenir:
```bash
docker compose up -d            # postgres, redis, rabbitmq, zookeeper, kafka
```

**2) Backend** (yeni terminal):
```bash
cd backend
npm install
npm start                       # http://localhost:5000  (sağlık: /health)
npm run worker                  # (ayrı terminal) RabbitMQ tüketici + Kafka üretici
npm run kafka-consumer          # (ayrı terminal, opsiyonel) Kafka olay günlüğü
```

**3) Mobil** (yeni terminal):
```bash
cd mobile
npm install
# app.json → expo.extra.apiBaseUrl değerini bilgisayarınızın LAN IP'siyle güncelleyin
#   (ipconfig ile öğrenin; örn. http://192.168.1.50:5000). Cihazda localhost ÇALIŞMAZ.
npx expo start                  # QR ile Expo Go veya emülatörde açın
```

**Demo girişi:** `demo@flend.com` / `demo1234` (veya yeni hesap oluşturun).

Alternatif: her şeyi container'da çalıştırmak için `docker compose --profile full up`.

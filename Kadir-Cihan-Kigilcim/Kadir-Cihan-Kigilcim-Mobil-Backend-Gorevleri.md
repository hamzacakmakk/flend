# Kadir Cihan Kığılcım'ın Mobil Backend Görevleri

**Mobil Front-end ile Back-end Bağlanmış Test Videosu:** [Link buraya eklenecek](https://example.com)

> Birleşik backend: `backend/` (Express + PostgreSQL). Mobil istemci: `mobile/lib/api/pricing.ts`. Mobilden API'ye giden isteğin ve dönen sonucun ekrana yansıdığı net görünmelidir.

## 1. Dinamik Fiyatlandırma Kuralı Oluşturma Servisi
- **Endpoint:** `POST /api/pricing-rules`
- **İstemci:** `createPricingRule()`
- **Controller:** `backend/controllers/pricingController.js → createRule`

## 2. Fiyatlandırma Kuralını Atama Servisi
- **Endpoint:** `POST /api/pricing-rules/:ruleId/assign`
- **İstemci:** `assignPricingRule()` (çoklu hedef desteği)
- **Controller:** `pricingController.js → assignRule`

## 3. Aktif Kuralları Listeleme Servisi
- **Endpoint:** `GET /api/pricing-rules`
- **İstemci:** `getPricingRules()`
- **Controller:** `pricingController.js → listRules` (atamalarla birlikte)

## 4. Optimum BuyBox Fiyatı Önerisi Servisi
- **Endpoint:** `GET /api/pricing-rules/optimum-price/:productId`
- **İstemci:** `getOptimumPrice()`
- **Controller:** `pricingController.js → suggestPrice` (rakip + kural + maliyet eşiği algoritması)

## 5. Fiyatlandırma Kuralını Güncelleme Servisi
- **Endpoint:** `PUT /api/pricing-rules/:ruleId`
- **İstemci:** `updatePricingRule()` (kısmi güncelleme)
- **Controller:** `pricingController.js → updateRule`

## 6. Fiyatlandırma Kuralını Silme Servisi
- **Endpoint:** `DELETE /api/pricing-rules/:ruleId`
- **İstemci:** `deletePricingRule()`
- **Controller:** `pricingController.js → deleteRule` (atamalar cascade)

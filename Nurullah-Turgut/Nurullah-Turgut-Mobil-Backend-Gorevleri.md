# Nurullah Turgut'un Mobil Backend Görevleri

**Mobil Front-end ile Back-end Bağlanmış Test Videosu:** [Link buraya eklenecek](https://example.com)

> Birleşik backend: `backend/` (Express + PostgreSQL). Mobil istemci: `mobile/lib/api/dashboard.ts` ve `mobile/lib/api/notifications.ts`. Mobilden API'ye giden isteğin ve dönen sonucun ekrana yansıdığı net görünmelidir.

## 1. Özet İstatistikleri Getirme Servisi
- **Endpoint:** `GET /api/dashboard/stats`
- **İstemci:** `getDashboardStats()`
- **Controller:** `backend/controllers/analyticsController.js → getDashboard` (kayıt yoksa canlı sayım)

## 2. Stok Eritme / Kampanya Önerileri Servisi
- **Endpoint:** `GET /api/analytics/suggestions`
- **İstemci:** `getSuggestions()`
- **Controller:** `analyticsController.js → getCampaignSuggestions` (önceliğe göre sıralı)

## 3. Geçmiş Bildirimleri Listeleme Servisi
- **Endpoint:** `GET /api/notifications`
- **İstemci:** `getNotifications()`
- **Controller:** `notificationController.js → getAll`

## 4. Alarm / Bildirim Kuralı Oluşturma Servisi
- **Endpoint:** `POST /api/alerts/rules`
- **İstemci:** `createAlertRule()`
- **Controller:** `notificationController.js → createAlertRule`

## 5. Bildirimi Okundu Olarak Güncelleme Servisi
- **Endpoint:** `PUT /api/notifications/:id/read`
- **İstemci:** `markNotificationRead()`
- **Controller:** `notificationController.js → markAsRead`

## 6. Bildirimi Silme Servisi
- **Endpoint:** `DELETE /api/notifications/:id`
- **İstemci:** `deleteNotification()`
- **Controller:** `notificationController.js → deleteNotification`

# Muhammed Hamza Çakmak'ın REST API Metotları (Rakip Takibi ve Scraper Sorumlusu)

**API Test Videosu:** [Link buraya eklenecek]

## 1. Rakip Ürün Linki Ekleme
- **Endpoint:** `POST /competitors`
- **Request Body:** 
  ```json
  {
    "productId": "uid-urun-123",
    "competitorUrl": "https://pazaryeri.com/urun-linki"
  }
  ```
- **Response:** `201 Created`

## 2. Manuel Bot Çalıştırma (Fiyat Güncelleme)
- **Endpoint:** `POST /competitors/sync`
- **Response:** `200 OK` - Senkronizasyon tetiklendi

## 3. Rakip Satıcılar Listesi
- **Endpoint:** `GET /products/{productId}/competitors`
- **Response:** `200 OK` - Rakip sayısı ve anlık fiyat listesi

## 4. Tarihsel Fiyat Grafiği
- **Endpoint:** `GET /competitors/{competitorId}/history`
- **Response:** `200 OK` - Zaman serisi fiyat logları

## 5. Takip Durumu Güncelleme
- **Endpoint:** `PUT /competitors/{competitorId}/status`
- **Request Body:** 
  ```json
  {
    "isActive": false
  }
  ```
- **Response:** `200 OK`

## 6. Rakip Ürün Takibini Silme
- **Endpoint:** `DELETE /competitors/{competitorId}`
- **Response:** `204 No Content`

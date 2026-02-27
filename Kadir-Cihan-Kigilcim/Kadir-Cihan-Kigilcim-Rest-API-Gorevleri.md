# Kadir Cihan Kığılcım'ın REST API Metotları

**API Test Videosu:** [Link buraya eklenecek](https://example.com)

## 1. Yeni Bir Dinamik Fiyatlandırma Kuralı Oluşturma
- **Endpoint:** `POST /api/pricing-rules`
- **Request Body:** 
  ```json
  {
    "ruleName": "Rakip altı kal",
    "ruleType": "COMPETITOR_BASED",
    "value": 1.0,
    "unit": "TRY"
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `201 Created` - Kural başarıyla oluşturuldu

## 2. Fiyatlandırma Kuralını Atama (İlişkilendirme)
- **Endpoint:** `POST /api/pricing-rules/assign`
- **Request Body:** 
  ```json
  {
    "ruleId": "uuid-rule-1234",
    "targetType": "PRODUCT",
    "targetIds": ["prod-001", "prod-002"]
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Kural başarıyla atandı

## 3. Aktif Fiyatlandırma Kurallarını Listeleme
- **Endpoint:** `GET /api/pricing-rules`
- **Path Parameters:** Yok (Query params olarak sayfalama alınabilir: `?page=1&size=20`)
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Kurallar başarıyla getirildi

## 4. Optimum BuyBox Fiyatı Önerisini Getirme
- **Endpoint:** `GET /api/pricing-rules/optimum-price/{productId}`
- **Path Parameters:** 
  - `productId` (string, required) - Ürün ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Optimum fiyat başarıyla hesaplandı ve getirildi

## 5. Fiyatlandırma Kuralı Parametrelerini Güncelleme
- **Endpoint:** `PUT /api/pricing-rules/{ruleId}`
- **Path Parameters:** 
  - `ruleId` (string, required) - Kural ID'si
- **Request Body:** 
  ```json
  {
    "ruleName": "Rakip altı kal",
    "value": 5.0,
    "unit": "TRY"
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Kural başarıyla güncellendi

## 6. Fiyatlandırma Kuralını Silme
- **Endpoint:** `DELETE /api/pricing-rules/{ruleId}`
- **Path Parameters:** 
  - `ruleId` (string, required) - Kural ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `204 No Content` - Kural başarıyla silindi

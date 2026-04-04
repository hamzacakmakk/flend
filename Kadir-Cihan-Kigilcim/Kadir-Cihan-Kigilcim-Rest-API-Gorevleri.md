# Kadir Cihan Kığılcım'ın REST API Metotları

**API Test Videosu:** [Link buraya eklenecek](https://example.com)

**REST API Domain Adresi:** `https://wvxagkluzxhngzkzmqwd.supabase.co/rest/v1`

## 1. Yeni Bir Dinamik Fiyatlandırma Kuralı Oluşturma
- **Endpoint:** `POST /pricing_rules`
- **Request Body:** 
  ```json
  {
    "rule_name": "Rakip altı kal",
    "rule_type": "COMPETITOR_BASED",
    "value": 1.0,
    "unit": "TRY"
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `201 Created` - Kural başarıyla oluşturuldu

## 2. Fiyatlandırma Kuralını Atama (İlişkilendirme)
- **Endpoint:** `POST /rule_assignments`
- **Request Body:** 
  ```json
  {
    "rule_id": "uuid-rule-1234",
    "target_type": "PRODUCT",
    "target_id": "prod-001"
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Kural başarıyla atandı

## 3. Aktif Fiyatlandırma Kurallarını Listeleme
- **Endpoint:** `GET /pricing_rules`
- **Path Parameters:** Yok (Query params olarak sayfalama alınabilir: `?limit=20&offset=0`)
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Kurallar başarıyla getirildi

## 4. Optimum BuyBox Fiyatı Önerisini Getirme
- **Endpoint:** `POST /rpc/get_optimum_price`
- **Request Body:** 
  ```json
  {
    "product_id_param": "prod-001"
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Optimum fiyat başarıyla hesaplandı ve getirildi

## 5. Fiyatlandırma Kuralı Parametrelerini Güncelleme
- **Endpoint:** `PATCH /pricing_rules?id=eq.{ruleId}`
- **Query Parameters:** 
  - `id=eq.{ruleId}` (string, required) - Kural ID'si
- **Request Body:** 
  ```json
  {
    "rule_name": "Rakip altı kal",
    "value": 5.0,
    "unit": "TRY"
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Kural başarıyla güncellendi

## 6. Fiyatlandırma Kuralını Silme
- **Endpoint:** `DELETE /pricing_rules?id=eq.{ruleId}`
- **Query Parameters:** 
  - `id=eq.{ruleId}` (string, required) - Kural ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `204 No Content` - Kural başarıyla silindi

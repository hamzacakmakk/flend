# Mehmet Taşçı'nın REST API Metotları

**Yayınlanan REST API Domain Adresi:** `https://flendv2.vercel.app`
**API Test Videosu:** [https://youtu.be/a34A8Ha5aYI?si=C-s4bKunrxMZF3zi]

---

## 0. API Çalışma Kontrolü (Health Check)

**Endpoint:** `POST /api/health`

**Açıklama:** API'nin düzgün çalışıp çalışmadığını kontrol eder.

**Response:** `200 OK` - API başarıyla çalışıyor

---

## 1. Entegrasyon Ekleme (Add Integration)

**Endpoint:** `POST /api/integrations`

**Açıklama:** Sisteme e-ticaret uygulama satıcı profilini entegre eder.

**Request Body:**
```json
{
  "marketplace_name": "diğer",
  "api_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsamlxZXZ1dWZyZ2hwdHptdWJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDQ3NTksImV4cCI6MjA5MDcyMDc1OX0.pMCBDTWKSH2Q65agj5IxuGzDTDAdCdhVO_LoXOmYuUQ"
}
```

**Response:** `201 Created` - Entegrasyon başarıyla oluşturuldu

---

## 2. Entegrasyon Senkronizasyonu (Sync Integration)

**Endpoint:** `POST /api/integrations/{integrationId}/sync`

**Path Parameters:**
- `integrationId` (string, required) - Entegrasyon ID'si

**Açıklama:** Entegrasyonlardan çekilen ürün verilerini senkronize eder.

**Response:** `200 OK` - Senkronizasyon başarıyla tamamlandı

---

## 3. Ürünleri Listeleme (Display All Products)

**Endpoint:** `GET /api/products`

**Açıklama:** Entegre edilen pazaryerinden satıcının kendi ürün listesini sisteme çekip listeleme.

**Response:** `200 OK` - Ürün listesi başarıyla getirildi

---

## 4. Tekil Ürün Bilgisi Getirme (Get Single Product)

**Endpoint:** `GET /api/products/{productId}`

**Path Parameters:**
- `productId` (string, required) - Ürün ID'si

**Açıklama:** Sistemdeki tekil bir ürünün detaylarını (stok adedi, güncel satış fiyatı) getirme.

**Response:** `200 OK` - Ürün bilgileri başarıyla getirildi

---

## 5. Min Fiyat Güncelleme (Update Min Price)

**Endpoint:** `PUT /api/products/{productId}/min-price`

**Path Parameters:**
- `productId` (string, required) - Ürün ID'si

**Açıklama:** Sistemdeki bir ürünün "Minimum Satış Fiyatı" (zarar etmemek için taban fiyat) sınırını güncelleme.

**Request Body:**
```json
{
  "min_price": 2500.0
}
```

**Response:** `200 OK` - Minimum fiyat başarıyla güncellendi

---

## 6. Entegrasyon Güncelleme (Update Integration)

**Endpoint:** `PUT /api/integrations/{integrationId}`

**Path Parameters:**
- `integrationId` (string, required) - Entegrasyon ID'si

**Açıklama:** Pazaryeri API bağlantı bilgilerini (süresi dolan token vb.) güncelleme.

**Response:** `200 OK` - Entegrasyon başarıyla güncellendi

---

## 7. Ürün Silme (Delete Product)

**Endpoint:** `DELETE /api/products/{productId}`

**Path Parameters:**
- `productId` (string, required) - Ürün ID'si

**Açıklama:** Artık satışı yapılmayan/takip edilmek istenmeyen bir ürünü kendi envanter panelinden silme.

**Response:** `204 No Content` - Ürün başarıyla silindi

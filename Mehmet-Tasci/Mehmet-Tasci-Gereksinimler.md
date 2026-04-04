# Mehmet Taşcı'nın Gereksinimleri 


1. **Pazaryeri Entegrasyonu Ekleme**
   - **Türü:** POST (Create)
   - **Endpoint:** `POST /api/integrations`
   - **Açıklama:** Pazaryeri API entegrasyon bilgilerini (API Key/Secret) sisteme ekleme.

2. **Ürün Listesini Çekme**
   - **Türü:** GET (Read)
   - **Endpoint:** `GET /api/products`
   - **Açıklama:** Entegre edilen pazaryerinden satıcının kendi ürün listesini sisteme çekip listeleme.

3. **Ürün Detayları Görüntüleme**
   - **Türü:** GET (Read)
   - **Endpoint:** `GET /api/products/:id`
   - **Açıklama:** Sistemdeki tekil bir ürünün detaylarını (stok adedi, güncel satış fiyatı) getirme.

4. **Minimum Satış Fiyatını Güncelleme**
   - **Türü:** PUT (Update)
   - **Endpoint:** `PUT /api/products/:id/min-price`
   - **Açıklama:** Sistemdeki bir ürünün "Minimum Satış Fiyatı" (Zarar etmemek için taban fiyat) sınırını güncelleme.

5. **API Bağlantı Bilgilerini Güncelleme**
   - **Türü:** PUT (Update)
   - **Endpoint:** `PUT /api/integrations/:id`
   - **Açıklama:** Pazaryeri API bağlantı bilgilerini (Süresi dolan token vb.) güncelleme.

6. **Ürün Silme / Takipten Çıkarma**
   - **Türü:** DELETE (Delete)
   - **Endpoint:** `DELETE /api/products/:id`
   - **Açıklama:** Artık satışı yapılmayan/takip edilmek istenmeyen bir ürünü kendi envanter panelinden silme.

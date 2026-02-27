# Mehmet'in Gereksinimleri



1. **Pazaryeri Entegrasyonu Ekleme**
   - **Türü:** POST (Create)
   - **Açıklama:** Pazaryeri API entegrasyon bilgilerini (API Key/Secret) sisteme ekleme.

2. **Ürün Listesini Çekme**
   - **Türü:** GET (Read)
   - **Açıklama:** Entegre edilen pazaryerinden satıcının kendi ürün listesini sisteme çekip listeleme.

3. **Ürün Detayları Görüntüleme**
   - **Türü:** GET (Read)
   - **Açıklama:** Sistemdeki tekil bir ürünün detaylarını (stok adedi, güncel satış fiyatı) getirme.

4. **Minimum Satış Fiyatını Güncelleme**
   - **Türü:** PUT (Update)
   - **Açıklama:** Sistemdeki bir ürünün "Minimum Satış Fiyatı" (Zarar etmemek için taban fiyat) sınırını güncelleme.

5. **API Bağlantı Bilgilerini Güncelleme**
   - **Türü:** PUT (Update)
   - **Açıklama:** Pazaryeri API bağlantı bilgilerini (Süresi dolan token vb.) güncelleme.

6. **Ürün Silme / Takipten Çıkarma**
   - **Türü:** DELETE (Delete)
   - **Açıklama:** Artık satışı yapılmayan/takip edilmek istenmeyen bir ürünü kendi envanter panelinden silme.

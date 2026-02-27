# Muhammed Hamza Çakmak'ın Gereksinimleri 

1. **Rakip Ürün Linki Ekleme**
   - **API Metodu:** `POST /competitors`
   - **Açıklama:** Satıcının kendi ürünüyle eşleştirmek üzere takip edilecek "Rakip Ürün Linkini" sisteme eklemesini sağlar.

2. **Manuel Bot Çalıştırma (Fiyat Güncelleme)**
   - **API Metodu:** `POST /competitors/sync`
   - **Açıklama:** Sistemin fiyatları anlık çekmesi için manuel "Botu Çalıştır / Fiyatları Güncelle" tetiklemesi yapar.

3. **Rakip Satıcılar ve Son Fiyatlar Listesi**
   - **API Metodu:** `GET /products/{productId}/competitors`
   - **Açıklama:** Bir ürüne ait eklenmiş tüm rakip satıcıların listesini ve çakılan son fiyatlarını getirir.

4. **Tarihsel Fiyat Değişim Grafiği (Loglar)**
   - **API Metodu:** `GET /competitors/{competitorId}/history`
   - **Açıklama:** Belirli bir rakibin tarihsel fiyat değişim grafiği verilerini (Geçmiş logları) getirir.

5. **Takip Durumu Güncelleme (Aktif/Pasif)**
   - **API Metodu:** `PUT /competitors/{competitorId}/status`
   - **Açıklama:** Belirli bir rakibin takip durumunu Aktif/Pasif olarak günceller (Geçici olarak takibi durdurma veya başlatma).

6. **Rakip Ürün Takibini Silme**
   - **API Metodu:** `DELETE /competitors/{competitorId}`
   - **Açıklama:** Sistemden bir rakip ürün takibini tamamen kaldırır ve siler.

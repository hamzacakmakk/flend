# Mehmet Taşcı'nın REST API Metotları

**API Test Videosu:** [Link buraya eklenecek](https://example.com)

## 2. Entegrasyon ve Envanter Sorumlusu (Integration & Inventory)
Satıcının Trendyol/Amazon vb. mağazasını sisteme bağlaması ve kendi ürünlerini yönetmesiyle ilgilenir.

- **POST (Create):** Pazaryeri API entegrasyon bilgilerini (API Key/Secret) sisteme ekleme.
- **GET (Read):** Entegre edilen pazaryerinden satıcının kendi ürün listesini sisteme çekip listeleme.
- **GET (Read):** Sistemdeki tekil bir ürünün detaylarını (stok adedi, güncel satış fiyatı) getirme.
- **PUT (Update):** Sistemdeki bir ürünün "Minimum Satış Fiyatı" (Zarar etmemek için taban fiyat) sınırını güncelleme.
- **PUT (Update):** Pazaryeri API bağlantı bilgilerini (Süresi dolan token vb.) güncelleme.
- **DELETE (Delete):** Artık satışı yapılmayan/takip edilmek istenmeyen bir ürünü kendi envanter panelinden silme.

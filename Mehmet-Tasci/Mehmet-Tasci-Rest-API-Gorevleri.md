
**Yayınlanan REST API Domain Adresi:** `https://flendv2.vercel.app/`
**API Test Videosu:** [Link buraya eklenecek](https://example.com)

### API Metotları ve Yolları

   **0. APİ çalışma kontrolü (Health_check)**
* **Metot:** `POST`
* **Yol:** `/api/health`
* **Açıklama:** APİ düzgün çalışıyor mu kontrol

   **0.1. Entegrasyon senkronizasyonu ()**Sync_integration
* **Metot:** `POST`
* **Yol:** `http://flendv2.vercel.app/api/integrations/bd573aa6-0f85-44fc-b618-39a45a9417bf/sync`(entegrasyon ıd path parameters alır)
* **Açıklama:** Entegrasyonlardan çekilen ürün verilerini senkronize eder.


    **1. Entegrasyon ekleme (Add_İntegration)**
* **Metot:** `POST`
* **Yol:** `/api/integrations`
* **Açıklama:** sisteme E-ticaret uygulama satıcı profilini entegre eder
* **Request Body:**
    ```json
  {
	"marketplace_name": "diğer",
    "api_key":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsamlxZXZ1dWZyZ2hwdHptdWJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDQ3NTksImV4cCI6MjA5MDcyMDc1OX0.pMCBDTWKSH2Q65agj5IxuGzDTDAdCdhVO_LoXOmYuUQ"
  }
    ```

    **2. Ürünleri görme (Display_All_Products)**
* **Metot:** `GET`
* **Yol:** `/api/products`
* **Açıklama:** Entegre edilen pazaryerinden satıcının kendi ürün listesini sisteme çekip listeleme



    **3. Tekil ürün bilgileri getirme (Health_check)**
* **Metot:** `GET`
* **Yol:** `/api/products/2e301917-bfdf-42c3-ba89-cad152ac284b`(ürün ıd path parameters alır)
* **Açıklama:**  Sistemdeki tekil bir ürünün detaylarını (stok adedi, güncel satış fiyatı) getirme.


    **4.Min fiyat güncelleme
* **Metot:** `PUT`
* **Yol:** `/api/products/2e301917-bfdf-42c3-ba89-cad152ac284b/min-price`(ürün ıd path parameters alır)
* **Açıklama:** Sistemdeki bir ürünün "Minimum Satış Fiyatı" (Zarar etmemek için taban fiyat) sınırını güncelleme.
* **Request Body:**
    ```json
    {
    "min_price":2500.0
    }
    ```

    **5. Entegrasyon güncelleme (Update_İntegration)**
* **Metot:** `PUT`
* **Yol:** `http://flendv2.vercel.app//api/integrations/bd573aa6-0f85-44fc-b618-39a45a9417bf`(entegrasyon ıd path parameters alır)
* **Açıklama:** Pazaryeri API bağlantı bilgilerini (Süresi dolan token vb.) güncelleme.

    **6.Ürün silme (Delete_Products)
* **Metot:** `DELETE`
* **Yol:** `/api/products/2e301917-bfdf-42c3-ba89-cad152ac284b`(ürün ıd path parameters alır)
* **Açıklama:** Artık satışı yapılmayan/takip edilmek istenmeyen bir ürünü kendi envanter panelinden silme.


## 2. Entegrasyon ve Envanter Sorumlusu (Integration & Inventory)
Satıcının Trendyol/Amazon vb. mağazasını sisteme bağlaması ve kendi ürünlerini yönetmesiyle ilgilenir.

- **POST (Create):** Pazaryeri API entegrasyon bilgilerini (API Key/Secret) sisteme ekleme.
- **GET (Read):** Entegre edilen pazaryerinden satıcının kendi ürün listesini sisteme çekip listeleme.
- **GET (Read):** Sistemdeki tekil bir ürünün detaylarını (stok adedi, güncel satış fiyatı) getirme.
- **PUT (Update):** Sistemdeki bir ürünün "Minimum Satış Fiyatı" (Zarar etmemek için taban fiyat) sınırını güncelleme.
- **PUT (Update):** Pazaryeri API bağlantı bilgilerini (Süresi dolan token vb.) güncelleme.
- **DELETE (Delete):** Artık satışı yapılmayan/takip edilmek istenmeyen bir ürünü kendi envanter panelinden silme.

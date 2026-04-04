# Mehmet Taşçı'nın Web Frontend Görevleri

**Proje Canlı Yayın Adresi:** [https://flendv2.vercel.app]
**Front-end Test Videosu:** [https://youtu.be/yM25RZ9fMLo?si=-VX0TmTvBfSdMGMz]

---

## 1. Pazaryeri Entegrasyonu Formu
**API Endpoint:** `POST /api/integrations`

**Görev:** Satıcının Trendyol/Amazon vb. API Key ve Secret Key'lerini sisteme tanımlayabileceği modern form sayfası tasarımı ve implementasyonu

**UI Bileşenleri:**
- Responsive entegrasyon formu (desktop ve mobile uyumlu)
- Select / Dropdown ile pazaryeri seçimi (Trendyol, Amazon, Hepsiburada vb.)
- API Key input alanı (type="text", autocomplete="off")
- Secret Key input alanı (type="password", göster/gizle toggle)
- "Entegrasyon Ekle" butonu (primary button style)
- Loading spinner (entegrasyon ekleme işlemi sırasında)
- Form container (card veya centered layout)
- Hata durumunda Error State ve Invalid Focus UI dönüşü

**Form Validasyonu:**
- HTML5 form validation (required attributes)
- JavaScript real-time validation
- API Key boş olamaz kontrolü
- Pazaryeri seçimi zorunlu kontrolü
- Tüm alanlar geçerli olmadan buton disabled
- Client-side ve server-side validation

**Kullanıcı Deneyimi:**
- Form hatalarını input altında gösterilmesi (inline validation)
- Başarılı entegrasyon sonrası success notification (toast/snackbar)
- Hata durumlarında kullanıcı dostu mesajlar (409 Conflict: "Bu entegrasyon zaten mevcut")
- Form submission prevention (double-click koruması)
- Accessible form labels ve ARIA attributes
- Keyboard navigation desteği (Tab, Enter)

**Teknik Detaylar:**
- Framework: React (Vite)
- State management (form state, loading state, error state)
- Routing (entegrasyon sayfasından ürünler sayfasına geçiş)
- SEO optimization (meta tags)
- Accessibility (WCAG 2.1 AA compliance)

---

## 2. Ürün Envanter Tablosu (DataGrid)
**API Endpoint:** `GET /api/products`

**Görev:** Pazaryerinden çekilen satıcı ürünlerinin bir web tablosunda / kart ızgarasında sergilendiği ana liste ekranı tasarımı ve implementasyonu

**UI Bileşenleri:**
- Responsive ürün listesi layout (desktop: tablo görünümü, mobile: kart görünümü)
- Tablo satırları (ürün görseli, adı, fiyat sütunları)
- Pagination (sayfalama) çubuğu
- Arama/Filtre çubuğu (opsiyonel)
- Refresh butonu veya auto-refresh
- "Çöp Kutusu" (Delete) ikonu her satırda
- Breadcrumb navigation (opsiyonel)

**Kullanıcı Deneyimi:**
- Loading skeleton screen (veri yüklenirken)
- Empty state (ürün yoksa bilgilendirme mesajı)
- Error state (yükleme hatası durumunda retry butonu)
- Smooth page transitions
- Responsive grid layout
- Satıra tıklandığında ürün detay sayfasına yönlendirme

**Teknik Detaylar:**
- Lazy loading images (ürün görselleri için)
- Image optimization (WebP format, responsive images)
- Client-side caching (localStorage/sessionStorage)
- State management (products data, loading, error states)
- Routing (ürün detay sayfasına geçiş)
- Deep linking desteği
- Meta tags (Open Graph)

---

## 3. Ürün Detay Görüntüleme Sayfası
**API Endpoint:** `GET /api/products/{productId}`

**Görev:** Listeden bir ürüne tıklandığında beliren detay kartı/sayfası tasarımı ve implementasyonu

**UI Bileşenleri:**
- Responsive ürün detay layout (desktop: sidebar + content, mobile: stacked)
- Ürün görseli (büyük boyutlu, placeholder destekli)
- Ürün adı (H1 heading)
- Güncel satış fiyatı (vurgulu typography)
- Ürün stok sayısı (badge ile gösterimli)
- "Min Fiyat Belirle" butonu (secondary button)
- "Ürünü Sil" butonu (danger button, alt kısımda)
- Geri dönüş butonu veya breadcrumb navigation

**Kullanıcı Deneyimi:**
- Loading skeleton screen (veri yüklenirken)
- Empty state (veri yoksa)
- Error state (yükleme hatası durumunda retry butonu)
- Smooth page transitions
- Responsive grid layout
- Print-friendly styles

**Teknik Detaylar:**
- Lazy loading images (ürün görseli için)
- Client-side caching (localStorage/sessionStorage)
- State management (product data, loading, error states)
- Routing (envanter listesine geri dönüş, düzenleme sayfasına geçiş)
- Deep linking desteği (ürün paylaşımı için)
- Meta tags (Open Graph, Twitter Cards)

---

## 4. Minimum Satış Fiyatı Belirleme Modal'ı
**API Endpoint:** `PUT /api/products/{productId}/min-price`

**Görev:** Tıklanan üründe taban "Minimum Satış Fiyatı" belirlemek için ortaya çıkan modal pencere tasarımı ve implementasyonu

**UI Bileşenleri:**
- Modal/Dialog component
- Modal Header ("Taban Fiyat Belirle")
- Number input alanı (mevcut değerle dolu)
- "Kaydet" butonu (primary button)
- "İptal" butonu (secondary button)
- Değişiklik yapıldığında "Kaydet" butonu aktif olur
- Unsaved changes indicator

**Form Validasyonu:**
- Fiyat formatı kontrolü (pozitif sayı, ondalık desteği)
- Minimum değer kontrolü (0'dan büyük olmalı)
- Real-time validation feedback
- Değişiklik yoksa "Kaydet" butonu disabled

**Kullanıcı Deneyimi:**
- Optimistic update (kaydet butonuna basıldığında UI anında güncellenir)
- Başarılı güncelleme sonrası success notification (toast/snackbar)
- Hata durumunda error mesajı ve değişiklikler geri alınır
- "İptal" butonuna basıldığında modal kapanır
- Keyboard navigation desteği (Escape ile kapatma)

**Teknik Detaylar:**
- Modal/Dialog component kullanımı
- Form state management (initial value, edited value, dirty state)
- Error handling (güncelleme başarısız olursa)
- Routing (modal kapandığında mevcut sayfada kalma)

---

## 5. API Bağlantı Güncelleme Ekranı
**API Endpoint:** `PUT /api/integrations/{integrationId}`

**Görev:** Sistemde geçerliliğini yitiren token'ları yenilemek için "Ayarlar / Entegrasyonlar" panelinin alt sekmesi olarak form arayüzü tasarımı ve implementasyonu

**UI Bileşenleri:**
- Responsive güncelleme formu
- Expired (Süresi Dolmuş) Alert Bar / Warning göstergesi
- API Key input alanı (mevcut değerle dolu)
- Secret Key input alanı (mevcut değerle dolu, göster/gizle toggle)
- "Güncelle" butonu (primary button)
- "İptal" butonu (secondary button)
- Değişiklik yapıldığında "Güncelle" butonu aktif olur

**Form Validasyonu:**
- API Key boş olamaz kontrolü
- Real-time validation feedback
- Değişiklik yoksa "Güncelle" butonu disabled

**Kullanıcı Deneyimi:**
- Optimistic update (güncelle butonuna basıldığında UI anında güncellenir)
- Başarılı güncelleme sonrası success notification (toast/snackbar)
- Hata durumunda error mesajı ve değişiklikler geri alınır
- "İptal" butonuna basıldığında değişiklik kaybı için confirmation dialog
- Beforeunload event (sayfa kapatılırken uyarı)

**Teknik Detaylar:**
- Form state management (initial values, edited values, dirty state)
- Routing (geri dönüş, kaydetme sonrası entegrasyonlar sayfasına dönüş)
- Unsaved changes warning (browser navigation)
- Form persistence (localStorage, draft saving)

---

## 6. Takipten Çıkartma İşlemi (Delete Action)
**API Endpoint:** `DELETE /api/products/{productId}`

**Görev:** Artık satışı yapılmayan ürünlerin listeden silinmesi sırasında kullanıcı deneyimi tasarımı ve implementasyonu

**UI Bileşenleri:**
- Tabloda "Çöp Kutusu" (Delete) ikonu (danger button style)
- Modal dialog (destructive action için)
- "Emin misiniz?" confirmation dialog (çift onay mekanizması)
- Warning icons ve visual cues
- Son onay ekranı (uyarı mesajları ile)

**Kullanıcı Deneyimi:**
- Destructive action için görsel uyarılar (kırmızı renk, warning icons)
- Açık ve net uyarı mesajları ("Bu işlem geri alınamaz")
- İptal seçeneği her zaman mevcut (modal close, cancel button)
- Silme işlemi sırasında loading indicator
- Başarılı silme sonrası success notification (toast/snackbar)
- Silinen ürünün listeden kaybolması (smooth animation)

**Akış Adımları:**
1. Ürün tablosunda "Çöp Kutusu" ikonuna tıklama
2. İlk uyarı modal dialog'u gösterilmesi
3. Onaylandığında silme işlemi gerçekleştirme
4. Başarılı silme sonrası ürün listesinin güncellenmesi
5. Success notification gösterilmesi

**Teknik Detaylar:**
- Modal/Dialog component kullanımı
- Error handling (silme başarısız olursa)
- State management (ürün listesinden kaldırma)
- Optimistic delete (UI'dan anında kaldırma, hata durumunda geri ekleme)
- Browser history management

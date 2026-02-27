1. **Yeni Bir Dinamik Fiyatlandırma Kuralı Oluşturma**
   - **API Metodu:** `POST /api/pricing-rules`
   - **Açıklama:** Yeni bir dinamik fiyatlandırma kuralı oluşturma (Örn: "Rakibin fiyatından 1 TL düşük yap"). Satıcının belirlediği kural türü, değer, ve koşulların toplanarak sisteme eklenmesini içerir.

2. **Fiyatlandırma Kuralını Atama (İlişkilendirme)**
   - **API Metodu:** `POST /api/pricing-rules/assign`
   - **Açıklama:** Oluşturulan bir fiyatlandırma kuralını belirli bir ürüne veya kategoriye atama (İlişkilendirme). Kullanıcıların tanımladıkları kuralları ilgili ürün gruplerında aktif hale getirmelerini sağlar.

3. **Aktif Fiyatlandırma Kurallarını Listeleme**
   - **API Metodu:** `GET /api/pricing-rules`
   - **Açıklama:** Satıcının oluşturduğu tüm aktif fiyatlandırma kurallarını listeleme. Sistemde yürürlükte olan kuralların detaylarını ve durumunu görüntüler.

4. **Optimum BuyBox Fiyatı Önerisini Getirme**
   - **API Metodu:** `GET /api/pricing-rules/optimum-price/{productId}`
   - **Açıklama:** Algoritmanın bir ürün için hesapladığı "Optimum BuyBox Fiyatı" önerisini getirme. Piyasa koşulları, rakip analizi ve ürünün minumum/maximum sınırlarına göre dinamik olarak hesaplanmış fiyatı sunar.

5. **Fiyatlandırma Kuralı Parametrelerini Güncelleme**
   - **API Metodu:** `PUT /api/pricing-rules/{ruleId}`
   - **Açıklama:** Mevcut bir fiyatlandırma kuralının parametrelerini (Örn: 1 TL yerine 5 TL) güncelleme. Satıcıların değişen stratejilerine göre kural detaylarında düzenleme yapabilmelerini sağlar.

6. **Fiyatlandırma Kuralını Silme**
   - **API Metodu:** `DELETE /api/pricing-rules/{ruleId}`
   - **Açıklama:** Artık kullanılmayan bir fiyatlandırma kuralını sistemden silme. İlgili kuralın pasife alınması veya kalıcı olarak silinip ürünlerden bağlantısının kesilmesini sağlar.

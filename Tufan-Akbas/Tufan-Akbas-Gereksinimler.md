# Tufan'ın Gereksinimleri (Kullanıcı ve Abonelik Sorumlusu)

## Kullanıcı ve Abonelik Sorumlusu (User & Subscription)
Sisteme kayıt olan satıcıları (e-ticaret firmalarını) ve SaaS aboneliklerini yönetir.

1. **Yeni Satıcı Hesabı Oluşturma (Register)**
   - **Türü:** POST (Create)
   - **Açıklama:** Yeni satıcı hesabı oluşturma.

2. **Satıcı Girişi Yapma (Login)**
   - **Türü:** POST (Create)
   - **Açıklama:** Satıcı girişi yapma ve JWT/Token üretimi.

3. **Profil ve Abonelik Bilgilerini Getirme**
   - **Türü:** GET (Read)
   - **Açıklama:** Giriş yapan satıcının profil bilgilerini ve mevcut abonelik paketini getirme.

4. **Profil veya Şifre Güncelleme**
   - **Türü:** PUT (Update)
   - **Açıklama:** Satıcının profil bilgilerini veya şifresini güncelleme.

5. **Satıcı Hesabı Silme / Dondurma**
   - **Türü:** DELETE (Delete)
   - **Açıklama:** Satıcı hesabını sistemden tamamen silme veya dondurma.

6. **SaaS Abonelik Paketlerini Listeleme**
   - **Türü:** GET (Read)
   - **Açıklama:** Sistemdeki mevcut SaaS abonelik paketlerini (Aylık/Yıllık planlar) listeleme.

# Tufan'ın REST API Metotları

**API Test Videosu:** [Link buraya eklenecek](https://example.com)

## Kullanıcı ve Abonelik Sorumlusu (User & Subscription)
Sisteme kayıt olan satıcıları (e-ticaret firmalarını) ve SaaS aboneliklerini yönetir.

- **POST (Create):** Yeni satıcı hesabı oluşturma (Register).
- **POST (Create):** Satıcı girişi yapma ve JWT/Token üretimi (Login).
- **GET (Read):** Giriş yapan satıcının profil bilgilerini ve mevcut abonelik paketini getirme.
- **PUT (Update):** Satıcının profil bilgilerini veya şifresini güncelleme.
- **DELETE (Delete):** Satıcı hesabını sistemden tamamen silme veya dondurma.
- **GET (Read):** Sistemdeki mevcut SaaS abonelik paketlerini (Aylık/Yıllık planlar) listeleme.

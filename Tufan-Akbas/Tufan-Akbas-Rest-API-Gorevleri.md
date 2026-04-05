# Tufan'ın REST API Metotları

**API Test Videosu:** [YouTube Video Linki Buraya Gelecek](https://youtube.com/...)
**REST API Domain Adresi:** `https://flend-inky.vercel.app`

## Kullanıcı ve Abonelik Sorumlusu (User & Subscription)
Sisteme kayıt olan satıcıları (e-ticaret firmalarını) ve SaaS aboneliklerini yönetir.

- **POST** `/v1/auth/register`
  - **Request Body:** `{ "email": "...", "password": "...", "companyName": "..." }`
  - **Açıklama:** Yeni satıcı hesabı oluşturma.
- **POST** `/v1/auth/login`
  - **Request Body:** `{ "email": "...", "password": "..." }`
  - **Açıklama:** Satıcı girişi yapma ve JWT Token üretimi.
- **GET** `/v1/users/profile`
  - **Headers:** `Authorization: Bearer <token>`
  - **Açıklama:** Giriş yapan satıcının profil bilgilerini ve mevcut abonelik paketini getirme.
- **PUT** `/v1/users/profile`
  - **Headers:** `Authorization: Bearer <token>`
  - **Request Body:** `{ "companyName": "...", "password": "..." }`
  - **Açıklama:** Satıcının profil bilgilerini veya şifresini güncelleme.
- **DELETE** `/v1/users/profile`
  - **Headers:** `Authorization: Bearer <token>`
  - **Açıklama:** Satıcı hesabını sistemden tamamen silme.
- **GET** `/v1/subscriptions/packages`
  - **Açıklama:** Sistemdeki mevcut SaaS abonelik paketlerini listeleme.


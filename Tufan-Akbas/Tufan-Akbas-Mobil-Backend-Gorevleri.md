# Tufan Akbaş'ın Mobil Backend Görevleri

**Mobil Front-end ile Back-end Bağlanmış Test Videosu:** [Link buraya eklenecek](https://example.com)

> Birleşik backend: `backend/` (Express + PostgreSQL, JWT). Mobil istemci: `mobile/lib/api/auth.ts` (token: `mobile/lib/auth/`). Mobilden API'ye giden isteğin ve dönen sonucun ekrana yansıdığı net görünmelidir.

## 1. Yeni Satıcı Hesabı Oluşturma Servisi
- **Endpoint:** `POST /api/auth/register`
- **İstemci:** `register()` → `mobile/lib/api/auth.ts`
- **Controller:** `backend/controllers/authController.js → register` (bcrypt hash + JWT üretimi)

## 2. Satıcı Girişi (JWT) Servisi
- **Endpoint:** `POST /api/auth/login`
- **İstemci:** `login()` → `AuthContext.signIn` token'ı `expo-secure-store`'a yazar
- **Controller:** `authController.js → login` (`bcrypt.compare` + `jwt.sign`)

## 3. Profil & Abonelik Getirme Servisi
- **Endpoint:** `GET /api/users/profile` (Bearer zorunlu)
- **İstemci:** `getProfile()`
- **Controller:** `authController.js → getProfile` (paket join)

## 4. Profil / Şifre Güncelleme Servisi
- **Endpoint:** `PUT /api/users/profile`
- **İstemci:** `updateProfile()`
- **Controller:** `authController.js → updateProfile` (kısmi güncelleme, parola yeniden hash)

## 5. Hesap Dondurma / Silme Servisi
- **Endpoint:** `DELETE /api/users/account` (`?hard=true` kalıcı sil)
- **İstemci:** `deleteAccount()`
- **Controller:** `authController.js → deleteAccount` (status = frozen)

## 6. Abonelik Paketlerini Listeleme Servisi
- **Endpoint:** `GET /api/subscriptions/plans` (auth'suz)
- **İstemci:** `getSubscriptionPlans()`
- **Controller:** `authController.js → listPackages`

# Muhammed Hamza Çakmak'ın Mobil Backend Görevleri
**Mobil Backend Entegrasyon Videosu:** [Link buraya eklenecek]

## 1. Zaman Serisi (Time-series) Veri Yönetimi
- **Görev:** `GET /competitors/{competitorId}/history` adresinden dönen JSON graf list verisinin parse edilmesi, chart kütüphanesine uygun Modele (Data Point) çevrilmesi.

## 2. Senkronizasyon İstek Kontrolü
- **Görev:** `POST /competitors/sync` isteği atıldığında, isteğin timeout'a düşmeden async takip edilmesi ve bitişinde UI listesini otomatik yenileme (Pull to refresh emit).

## 3. Optimistic Aktif/Pasif Durum Güncellemesi
- **Görev:** `PUT /status` isteğini attıktan sonra anında UI switch'inin dönmesi, bağlantı kopmasında geri tepmesi (rollback).

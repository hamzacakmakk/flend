// ==========================================================================
// routes/index.js — Birleşik API yüzeyi (30 endpoint + yardımcılar)
//
//  * Hamza'nın rakip-takibi endpoint'leri PREFIX'SİZ (/products, /competitors*)
//    → mevcut mobil istemci hiç bozulmaz.
//  * Diğer tüm modüller /api/* altında (üye doküman sözleşmeleriyle uyumlu).
//  * Kişisel hesap endpoint'leri requireAuth; geri kalan iş endpoint'leri
//    resolveUser (token yoksa demo kullanıcı) — demo token'sız da çalışır.
// ==========================================================================
import { Router } from 'express';
import { requireAuth, resolveUser } from '../middleware/auth.js';
import * as auth from '../controllers/authController.js';
import * as integration from '../controllers/integrationController.js';
import * as product from '../controllers/productController.js';
import * as competitor from '../controllers/competitorController.js';
import * as pricing from '../controllers/pricingController.js';
import * as analytics from '../controllers/analyticsController.js';
import * as notification from '../controllers/notificationController.js';

const router = Router();

// ── Tufan Akbaş — Auth & Abonelik (1-6) ─────────────────────────────────
router.post('/api/auth/register', auth.register);                  // 1
router.post('/api/auth/login', auth.login);                        // 2
router.get('/api/users/profile', requireAuth, auth.getProfile);    // 3
router.put('/api/users/profile', requireAuth, auth.updateProfile); // 4
router.delete('/api/users/account', requireAuth, auth.deleteAccount); // 5
router.get('/api/subscriptions/plans', auth.listPackages);         // 6

// ── Mehmet Taşcı — Pazaryeri & Envanter (7-12) ──────────────────────────
router.post('/api/integrations', resolveUser, integration.createIntegration);        // 7
router.get('/api/integrations', resolveUser, integration.listIntegrations);
router.post('/api/integrations/:id/sync', resolveUser, integration.syncProducts);    // 8 (mekanizma)
router.put('/api/integrations/:id', resolveUser, integration.updateIntegration);     // 11
router.delete('/api/integrations/:id', resolveUser, integration.deleteIntegration);
router.get('/api/inventory/products', resolveUser, product.getAllProducts);          // 8
router.get('/api/inventory/products/:id', resolveUser, product.getProductById);      // 9
router.put('/api/inventory/products/:id/min-price', resolveUser, product.updateMinPrice); // 10
router.delete('/api/inventory/products/:id', resolveUser, product.deleteProduct);    // 12

// ── Hamza Çakmak — Rakip Takibi (13-18) — PREFIX'SİZ ────────────────────
router.get('/products', resolveUser, competitor.getProducts);                        // yardımcı
router.post('/competitors', resolveUser, competitor.addCompetitor);                  // 13
router.post('/competitors/sync', resolveUser, competitor.syncCompetitors);           // 14
router.get('/products/:productId/competitors', resolveUser, competitor.listForProduct); // 15
router.get('/competitors/:competitorId/history', resolveUser, competitor.getHistory);   // 16
router.put('/competitors/:competitorId/status', resolveUser, competitor.updateStatus);  // 17
router.delete('/competitors/:competitorId', resolveUser, competitor.deleteCompetitor);  // 18

// ── Kadir Kığılcım — Fiyatlandırma Kuralları (19-24) ────────────────────
router.post('/api/pricing-rules', resolveUser, pricing.createRule);                  // 19
router.post('/api/pricing-rules/:ruleId/assign', resolveUser, pricing.assignRule);   // 20
router.get('/api/pricing-rules', resolveUser, pricing.listRules);                    // 21
router.get('/api/pricing-rules/optimum-price/:productId', resolveUser, pricing.suggestPrice); // 22
router.put('/api/pricing-rules/:ruleId', resolveUser, pricing.updateRule);           // 23
router.delete('/api/pricing-rules/:ruleId', resolveUser, pricing.deleteRule);        // 24

// ── Nurullah Turgut — İstatistik & Bildirim (25-30) ─────────────────────
router.get('/api/dashboard/stats', resolveUser, analytics.getDashboard);             // 25
router.get('/api/analytics/suggestions', resolveUser, analytics.getCampaignSuggestions); // 26
router.get('/api/notifications', resolveUser, notification.getAll);                   // 27
router.post('/api/alerts/rules', resolveUser, notification.createAlertRule);          // 28
router.get('/api/alerts/rules', resolveUser, notification.listAlertRules);            // yardımcı
router.put('/api/notifications/:id/read', resolveUser, notification.markAsRead);      // 29
router.delete('/api/notifications/:id', resolveUser, notification.deleteNotification);// 30

export default router;

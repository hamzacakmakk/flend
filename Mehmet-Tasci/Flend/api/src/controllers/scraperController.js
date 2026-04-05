// ============================================
// Genel E-Ticaret Scraper Controller
// ============================================

const MarketplaceScraper = require('../scrapers/marketplaceScraper');
const { AppError } = require('../middleware/errorHandler');

// Aktif scraper instance'ı (singleton)
let activeScraper = null;

// POST /api/scraper/profile - Profil/mağaza URL'sindeki ürünleri çek
const scrapeProfile = async (req, res, next) => {
  let scraper = null;
  try {
    const { profile_url, max_pages = 5, headless = true } = req.body;

    if (!profile_url) {
      throw new AppError('profile_url zorunludur. Bir e-ticaret sitesi profil/mağaza linki girin.', 400);
    }

    scraper = new MarketplaceScraper();

    // URL doğrulama
    const validation = scraper.validateProfileUrl(profile_url);
    if (!validation.valid) {
      throw new AppError(validation.message, 400);
    }

    console.log(`Scraping başlatılıyor: ${profile_url}`);
    await scraper.init(headless);

    const products = await scraper.scrapeProfileByUrl(
      validation.normalizedUrl || profile_url,
      max_pages
    );

    console.log(`✅ Scraping tamamlandı: ${products.length} ürün bulundu`);

    res.json({
      success: true,
      data: {
        source_url: profile_url,
        site_name: validation.siteName || 'Bilinmeyen Site',
        total_products: products.length,
        scraped_at: new Date().toISOString(),
        products,
      },
    });
  } catch (err) {
    console.error('❌ Scraper hatası:', err.message);
    next(err);
  } finally {
    if (scraper) {
      try { await scraper.close(); } catch (e) { /* ignore close errors */ }
    }
  }
};

// POST /api/scraper/login - Bir e-ticaret sitesine giriş yap (session başlat)
const loginSite = async (req, res, next) => {
  try {
    const { login_url, email, password } = req.body;

    if (!login_url) {
      throw new AppError('login_url zorunludur. Giriş sayfası URL\'sini girin.', 400);
    }
    if (!email || !password) {
      throw new AppError('email ve password zorunludur', 400);
    }

    // Mevcut scraper varsa kapat
    if (activeScraper) {
      await activeScraper.close();
    }

    activeScraper = new MarketplaceScraper();
    await activeScraper.init(false); // Giriş için görünür tarayıcı

    const success = await activeScraper.login(login_url, email, password);

    if (success) {
      res.json({
        success: true,
        message: 'Giriş başarılı. Session aktif.',
      });
    } else {
      await activeScraper.close();
      activeScraper = null;
      throw new AppError('Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.', 401);
    }
  } catch (err) {
    next(err);
  }
};

// GET /api/scraper/my-products - Giriş yapılan hesabın ürünlerini çek
const scrapeMyProducts = async (req, res, next) => {
  try {
    const { profile_url, max_pages = 5 } = req.query;

    if (!activeScraper || !activeScraper.isLoggedIn) {
      throw new AppError('Önce /api/scraper/login ile giriş yapmalısınız', 401);
    }

    if (!profile_url) {
      throw new AppError('profile_url query parametresi zorunludur', 400);
    }

    const validation = activeScraper.validateProfileUrl(profile_url);
    if (!validation.valid) {
      throw new AppError(validation.message, 400);
    }

    const products = await activeScraper.scrapeProfileByUrl(
      validation.normalizedUrl || profile_url,
      parseInt(max_pages)
    );

    res.json({
      success: true,
      data: {
        source_url: profile_url,
        site_name: validation.siteName || 'Bilinmeyen Site',
        total_products: products.length,
        scraped_at: new Date().toISOString(),
        products,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/scraper/product-detail - Ürün detayını çek
const scrapeProductDetail = async (req, res, next) => {
  try {
    const { product_url } = req.body;

    if (!product_url) {
      throw new AppError('product_url zorunludur', 400);
    }

    const scraper = activeScraper || new MarketplaceScraper();
    const needsClose = !activeScraper;

    if (needsClose) {
      await scraper.init(true);
    }

    try {
      const detail = await scraper.scrapeProductDetail(product_url);

      if (!detail) {
        throw new AppError('Ürün detayı çekilemedi', 404);
      }

      res.json({
        success: true,
        data: detail,
      });
    } finally {
      if (needsClose) await scraper.close();
    }
  } catch (err) {
    next(err);
  }
};

// POST /api/scraper/logout - Oturumu kapat
const logoutSession = async (req, res, next) => {
  try {
    if (activeScraper) {
      await activeScraper.close();
      activeScraper = null;
    }

    res.json({
      success: true,
      message: 'Scraper oturumu kapatıldı',
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/scraper/supported-sites - Desteklenen siteleri listele
const getSupportedSites = async (req, res) => {
  const sites = MarketplaceScraper.getSupportedSites();
  res.json({
    success: true,
    data: sites,
  });
};

// POST /api/scraper/validate-url - URL doğrulama
const validateUrl = async (req, res) => {
  const { url } = req.body;
  const scraper = new MarketplaceScraper();
  const result = scraper.validateProfileUrl(url);
  res.json({
    success: true,
    data: result,
  });
};

module.exports = {
  scrapeProfile,
  loginSite,
  scrapeMyProducts,
  scrapeProductDetail,
  logoutSession,
  getSupportedSites,
  validateUrl,
};

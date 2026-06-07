// ==========================================================================
// lib/api/types.ts — Tüm API veri modelleri (TS arayüzleri)
// NUMERIC kolonlar pg'den string gelebilir → number | string + format helper.
// ==========================================================================
export type Money = number | string;

// ── Hamza — Rakip Takibi (mevcut) ────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  current_price: Money;
  image_url?: string | null;
  min_price?: Money | null;
  stock_quantity?: number;
}

export interface Competitor {
  id: string;
  product_id: string;
  competitor_url: string;
  seller_name: string;
  last_price: Money | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PriceHistory {
  id: string;
  competitor_id: string;
  price: Money;
  recorded_at: string;
}

export interface DataPoint {
  date: string;
  price: number;
}

// ── Tufan — Auth & Abonelik ──────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  company_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  subscription_package_id?: string | null;
  status: string;
  created_at?: string;
  package_name?: string | null;
  package_price?: Money | null;
  package_period?: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SubscriptionPackage {
  id: string;
  name: string;
  price: Money;
  period: string;
  features: string[];
}

// ── Mehmet — Pazaryeri & Envanter ────────────────────────────────────────
export interface Integration {
  id: string;
  user_id?: string;
  marketplace_name: string;
  api_key?: string | null;
  api_secret?: string | null;
  base_url?: string | null;
  status: string;
  created_at?: string;
}

export interface InventoryProduct {
  id: string;
  name: string;
  price: Money;
  min_price: Money | null;
  stock_quantity: number;
  currency: string;
  marketplace_name?: string | null;
  integration_id?: string | null;
  marketplace_product_id?: string | null;
  barcode?: string | null;
  image_url?: string | null;
  is_active: boolean;
  created_at?: string;
}

// ── Kadir — Fiyatlandırma ─────────────────────────────────────────────────
export type RuleType = 'COMPETITOR_BASED' | 'MARGIN_BASED';
export type RuleUnit = 'TRY' | '%';

export interface RuleAssignment {
  id: string;
  target_type: 'PRODUCT' | 'CATEGORY';
  target_id: string;
}

export interface PricingRule {
  id: string;
  user_id?: string;
  rule_name: string;
  rule_type: RuleType;
  value: Money;
  unit: RuleUnit;
  created_at?: string;
  assignments?: RuleAssignment[];
}

export interface OptimumPrice {
  productId: string;
  currentPrice: number;
  minPrice: number;
  lowestCompetitorPrice: number | null;
  suggestedPrice: number;
  currency: string;
  ruleApplied: string | null;
  reason: string;
}

// ── Nurullah — İstatistik & Bildirim ─────────────────────────────────────
export interface DashboardStats {
  buybox_win_rate: Money;
  tracked_products_count: number;
  total_sales: number;
  active_campaigns: number;
  revenue: Money;
  active_competitors?: number;
  recorded_at?: string;
}

export interface CampaignSuggestion {
  id: string;
  product_name: string;
  product_sku?: string | null;
  current_stock: number;
  sales_velocity: Money;
  days_of_stock: number;
  suggested_discount: Money;
  suggestion_type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  created_at?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_read: boolean;
  created_at: string;
}

export interface AlertRule {
  id: string;
  rule_name: string;
  condition_type: string;
  threshold_value: Money;
  threshold_unit: string;
  is_active: boolean;
  notify_via?: string;
  created_at?: string;
}

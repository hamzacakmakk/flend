// ==========================================================================
// lib/api/pricing.ts — Kadir (19-24) — fiyatlandırma kuralları
// ==========================================================================
import { httpGet, httpPost, httpPut, httpDelete } from '../http';
import type { PricingRule, OptimumPrice, RuleType, RuleUnit } from './types';

export interface RuleInput {
  ruleName: string;
  ruleType: RuleType;
  value: number;
  unit: RuleUnit;
}

// 19. POST /api/pricing-rules — Kural oluşturma
export function createPricingRule(input: RuleInput): Promise<PricingRule> {
  return httpPost<PricingRule>('/api/pricing-rules', input);
}

// 21. GET /api/pricing-rules — Kuralları listeleme
export function getPricingRules(): Promise<PricingRule[]> {
  return httpGet<PricingRule[]>('/api/pricing-rules');
}

// 20. POST /api/pricing-rules/:ruleId/assign — Kuralı ürüne atama
export function assignPricingRule(
  ruleId: string,
  input: { targetType?: 'PRODUCT' | 'CATEGORY'; targetIds: string[] }
): Promise<{ message: string }> {
  return httpPost(`/api/pricing-rules/${ruleId}/assign`, input);
}

// 22. GET /api/pricing-rules/optimum-price/:productId — Optimum öneri
export function getOptimumPrice(productId: string): Promise<OptimumPrice> {
  return httpGet<OptimumPrice>(`/api/pricing-rules/optimum-price/${productId}`);
}

// 23. PUT /api/pricing-rules/:ruleId — Kuralı güncelleme
export function updatePricingRule(
  ruleId: string,
  input: Partial<RuleInput>
): Promise<PricingRule> {
  return httpPut<PricingRule>(`/api/pricing-rules/${ruleId}`, input);
}

// 24. DELETE /api/pricing-rules/:ruleId — Kuralı silme
export function deletePricingRule(ruleId: string): Promise<{ message: string }> {
  return httpDelete<{ message: string }>(`/api/pricing-rules/${ruleId}`);
}

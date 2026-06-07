// Ürün Detay — Mehmet (9 detay, 10 min fiyat, 12 sil) + Kadir (22 optimum öneri)
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import {
  getInventoryProduct, updateMinPrice, deleteInventoryProduct, getOptimumPrice,
  InventoryProduct, OptimumPrice,
} from '../../lib/api';
import { colors } from '../../lib/theme';
import { formatTRY, formatNumber } from '../../lib/format';
import { ScreenHeader, Card, FormInput, PrimaryButton, Badge, LoadingScreen, ErrorView } from '../../components/ui';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<InventoryProduct | null>(null);
  const [optimum, setOptimum] = useState<OptimumPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [optLoading, setOptLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const p = await getInventoryProduct(id);
      setProduct(p);
      setMinPrice(p.min_price != null ? String(p.min_price) : '');
      setError('');
      // Optimum öneri (paralel, hata olsa da ekran açılır)
      setOptLoading(true);
      getOptimumPrice(id).then(setOptimum).catch(() => {}).finally(() => setOptLoading(false));
    } catch (e: any) {
      setError(e?.message || 'Ürün yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const saveMinPrice = async () => {
    const v = Number(minPrice);
    if (Number.isNaN(v) || v < 0) { Alert.alert('Hata', 'Geçerli bir fiyat girin.'); return; }
    setSaving(true);
    try {
      const updated = await updateMinPrice(id, v);
      setProduct(updated);
      Alert.alert('Başarılı', 'Minimum fiyat güncellendi.');
      getOptimumPrice(id).then(setOptimum).catch(() => {});
    } catch (e: any) {
      Alert.alert('Hata', e?.message || 'Güncellenemedi.');
    } finally {
      setSaving(false);
    }
  };

  const refreshOptimum = () => {
    setOptLoading(true);
    getOptimumPrice(id).then(setOptimum).catch(() => {}).finally(() => setOptLoading(false));
  };

  const confirmDelete = () => {
    Alert.alert('Ürünü Sil', 'Bu ürün envanterden kaldırılsın mı?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive', onPress: async () => {
          try { await deleteInventoryProduct(id); router.back(); }
          catch (e: any) { Alert.alert('Hata', e?.message || 'Silinemedi.'); }
        },
      },
    ]);
  };

  if (loading) return <LoadingScreen text="Ürün yükleniyor..." />;
  if (error || !product) return <View style={styles.safe}><ScreenHeader title="Ürün" onBack={() => router.back()} /><ErrorView message={error || 'Bulunamadı'} onRetry={load} /></View>;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Ürün Detayı" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card>
          <Text style={styles.name}>{product.name}</Text>
          <View style={styles.row}>
            {product.marketplace_name ? <Badge text={product.marketplace_name} /> : null}
            <Badge text={`Stok: ${formatNumber(product.stock_quantity)}`} color={colors.muted} bg={colors.borderLight} />
          </View>
          <View style={styles.priceBlock}>
            <Text style={styles.priceLabel}>Satış Fiyatı</Text>
            <Text style={styles.priceVal}>{formatTRY(product.price)}</Text>
          </View>
          {product.barcode ? <Text style={styles.meta}>Barkod: {product.barcode}</Text> : null}
        </Card>

        {/* 22. Optimum BuyBox önerisi */}
        <Card style={{ marginTop: 14, backgroundColor: '#f5f3ff', borderColor: '#ddd6fe' }}>
          <View style={styles.optHead}>
            <Text style={styles.optTitle}>💡 Optimum Fiyat Önerisi</Text>
            <Text style={styles.optRefresh} onPress={refreshOptimum}>{optLoading ? '...' : 'Yenile'}</Text>
          </View>
          {optimum ? (
            <>
              <Text style={styles.optPrice}>{formatTRY(optimum.suggestedPrice)}</Text>
              <View style={styles.optRow}>
                <Text style={styles.optMeta}>Rakip: {optimum.lowestCompetitorPrice != null ? formatTRY(optimum.lowestCompetitorPrice) : '—'}</Text>
                <Text style={styles.optMeta}>Kural: {optimum.ruleApplied || 'Yok'}</Text>
              </View>
              <Text style={styles.optReason}>{optimum.reason}</Text>
            </>
          ) : (
            <Text style={styles.meta}>{optLoading ? 'Hesaplanıyor...' : 'Öneri için "Yenile"ye dokunun.'}</Text>
          )}
        </Card>

        {/* 10. Min fiyat güncelle */}
        <Card style={{ marginTop: 14 }}>
          <Text style={styles.sectionTitle}>Minimum Satış Fiyatı (Maliyet Eşiği)</Text>
          <FormInput label="Min. Fiyat (₺)" value={minPrice} onChangeText={setMinPrice} placeholder="60000" keyboardType="numeric" />
          <PrimaryButton title="Min. Fiyatı Güncelle" onPress={saveMinPrice} loading={saving} icon="pricetag-outline" />
        </Card>

        {/* 12. Sil */}
        <View style={{ marginTop: 14 }}>
          <PrimaryButton title="Ürünü Envanterden Kaldır" onPress={confirmDelete} variant="danger" icon="trash-outline" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingTop: 4 },
  name: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 10 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  priceBlock: { gap: 2 },
  priceLabel: { fontSize: 11, color: colors.faint, fontWeight: '700', textTransform: 'uppercase' },
  priceVal: { fontSize: 24, fontWeight: '800', color: colors.text },
  meta: { fontSize: 12, color: colors.muted, marginTop: 8 },
  optHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  optTitle: { fontSize: 14, fontWeight: '800', color: colors.accent },
  optRefresh: { fontSize: 12, fontWeight: '700', color: colors.primary },
  optPrice: { fontSize: 26, fontWeight: '800', color: colors.accent, marginVertical: 4 },
  optRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  optMeta: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  optReason: { fontSize: 12, color: colors.muted, lineHeight: 17, marginTop: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: 12 },
});

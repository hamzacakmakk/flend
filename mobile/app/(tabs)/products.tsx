// Ürünler sekmesi — Envanter (Mehmet 8) → /product/[id]
// GET /api/inventory/products
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getInventoryProducts, InventoryProduct } from '../../lib/api';
import { colors } from '../../lib/theme';
import { formatTRY, formatNumber } from '../../lib/format';
import { LoadingScreen, ErrorView, EmptyState } from '../../components/ui';

export default function ProductsTab() {
  const router = useRouter();
  const [items, setItems] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      setItems(await getInventoryProducts());
      setError('');
    } catch (e: any) {
      setError(e?.message || 'Ürünler yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <LoadingScreen text="Envanter yükleniyor..." />;
  if (error) return <View style={styles.safe}><ErrorView message={error} onRetry={() => load()} /></View>;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Envanter</Text>
          <Text style={styles.sub}>{items.length} ürün</Text>
        </View>
        <TouchableOpacity style={styles.intBtn} onPress={() => router.push('/integrations')} activeOpacity={0.85}>
          <Ionicons name="link-outline" size={16} color="#fff" />
          <Text style={styles.intBtnText}>Pazaryeri</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[colors.primary]} tintColor={colors.primary} />}
        ListEmptyComponent={<EmptyState icon="cube-outline" title="Envanter boş" body="Pazaryeri ekleyip ürünleri senkronize edin." />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => router.push(`/product/${item.id}`)}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.price}>{formatTRY(item.price)}</Text>
                {item.marketplace_name ? <View style={styles.mp}><Text style={styles.mpText}>{item.marketplace_name}</Text></View> : null}
              </View>
              <View style={styles.subRow}>
                <Text style={styles.subMeta}>Stok: {formatNumber(item.stock_quantity)}</Text>
                <Text style={styles.subMeta}>Min: {item.min_price != null ? formatTRY(item.min_price) : '—'}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  sub: { fontSize: 12, color: colors.muted, fontWeight: '600', marginTop: 2 },
  intBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12 },
  intBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  list: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 24, gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 18, padding: 16, gap: 12, borderWidth: 1, borderColor: colors.borderLight, shadowColor: '#64748b', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  name: { fontSize: 14, fontWeight: '700', color: colors.text, lineHeight: 19 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  price: { fontSize: 14, fontWeight: '800', color: colors.text },
  mp: { backgroundColor: colors.surfaceAlt, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  mpText: { fontSize: 10, fontWeight: '700', color: colors.primary },
  subRow: { flexDirection: 'row', gap: 16 },
  subMeta: { fontSize: 11, color: colors.faint, fontWeight: '600' },
});

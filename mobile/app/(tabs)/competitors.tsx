// Rakipler sekmesi — ürün listesi → /competitor/[productId] (Hamza akışı girişi)
// GET /products
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getProducts, Product } from '../../lib/api';
import { colors } from '../../lib/theme';
import { formatTRY } from '../../lib/format';
import { LoadingScreen, ErrorView, EmptyState } from '../../components/ui';

export default function CompetitorsTab() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      setProducts(await getProducts());
      setError('');
    } catch (e: any) {
      setError(e?.message || 'Ürünler yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <LoadingScreen text="Ürünler yükleniyor..." />;
  if (error) return <View style={styles.safe}><ErrorView message={error} onRetry={() => load()} /></View>;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Rakip Takibi</Text>
          <Text style={styles.sub}>Ürün seçip rakiplerini yönetin</Text>
        </View>
        <View style={styles.countBadge}><Text style={styles.countText}>{products.length} Ürün</Text></View>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[colors.primary]} tintColor={colors.primary} />}
        ListEmptyComponent={<EmptyState icon="cube-outline" title="Henüz ürün yok" body="Ürünler eklendiğinde burada görünecek." />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => router.push(`/competitor/${item.id}`)}>
            <View style={styles.idx}><Text style={styles.idxText}>{index + 1}</Text></View>
            <View style={{ flex: 1, gap: 5 }}>
              <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Satış Fiyatı</Text>
                <Text style={styles.priceVal}>{formatTRY(item.current_price)}</Text>
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
  countBadge: { backgroundColor: colors.surfaceAlt, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  countText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  list: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 24, gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 18, padding: 16, gap: 14, borderWidth: 1, borderColor: colors.borderLight, shadowColor: '#64748b', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  idx: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  idxText: { fontWeight: '800', fontSize: 14, color: colors.primary },
  name: { fontSize: 14, fontWeight: '700', color: colors.text, lineHeight: 19 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  priceLabel: { fontSize: 11, color: colors.faint, fontWeight: '500' },
  priceVal: { fontSize: 13, fontWeight: '800', color: colors.text },
});

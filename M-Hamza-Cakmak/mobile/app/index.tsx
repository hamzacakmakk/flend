// ProductsScreen — GET /products
// Tüm ürünleri listele, ürüne tıkla → CompetitorsScreen

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getProducts, Product } from '../lib/api';

export default function ProductsScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await getProducts();
      setProducts(data);
      setError('');
    } catch {
      setError('Ürünler yüklenemedi. İnternet bağlantınızı kontrol edin.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const renderItem = ({ item, index }: { item: Product; index: number }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/competitors/${item.id}`)}
      activeOpacity={0.85}
    >
      {/* Numara */}
      <View style={styles.indexBadge}>
        <Text style={styles.indexText}>{index + 1}</Text>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Satış Fiyatı</Text>
          <Text style={styles.priceValue}>
            {Number(item.current_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
          </Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#6366f1" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Ürünler yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <Ionicons name="wifi-outline" size={48} color="#cbd5e1" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => load()}>
            <Text style={styles.retryText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoWrap}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoLetter}>F</Text>
          </View>
          <View>
            <Text style={styles.logoTitle}>Flend</Text>
            <Text style={styles.logoSub}>Rakip Takibi</Text>
          </View>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{products.length} Ürün</Text>
        </View>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor="#6366f1"
            colors={['#6366f1']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="cube-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Henüz ürün yok</Text>
            <Text style={styles.emptyBody}>Ürünler listeye eklendiğinde burada görünecek.</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#f8fafc',
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  logoLetter: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 20,
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 22,
  },
  logoSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#a855f7',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  countBadge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366f1',
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    gap: 14,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  indexBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontWeight: '800',
    fontSize: 14,
    color: '#6366f1',
  },
  cardContent: {
    flex: 1,
    gap: 6,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 19,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  retryBtn: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyBox: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    marginTop: 8,
  },
  emptyBody: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

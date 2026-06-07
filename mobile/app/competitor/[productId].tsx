// CompetitorsScreen — Mobil Frontend Görevi 1, 3 + Mobil Backend Görevi 2, 3
// GET /products/{productId}/competitors
// POST /competitors (ekle)
// POST /competitors/sync (bot)
// PUT /competitors/{id}/status (optimistic toggle)
// DELETE /competitors/{id}

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  getCompetitorsByProduct,
  getProducts,
  addCompetitor,
  updateCompetitorStatus,
  deleteCompetitor,
  Competitor,
  Product,
} from '../../lib/api';
import CompetitorCard from '../../components/CompetitorCard';
import SyncButton from '../../components/SyncButton';
import AddCompetitorModal from '../../components/AddCompetitorModal';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';

export default function CompetitorsScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const router = useRouter();

  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Competitor | null>(null);

  // ── Veri yükleme ───────────────────────────────────────────────────────────
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [comps, products] = await Promise.all([
        getCompetitorsByProduct(productId),
        getProducts(),
      ]);
      setCompetitors(comps);
      setProduct(products.find((p) => p.id === productId) ?? null);
    } catch {
      Alert.alert('Hata', 'Veriler yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [productId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Rakip ekleme ───────────────────────────────────────────────────────────
  const handleAdd = async (data: { competitorUrl: string; sellerName: string }) => {
    await addCompetitor({ productId, ...data });
    await loadData();
  };

  // ── Mobil Backend Görevi 3: Optimistic toggle + rollback ──────────────────
  const handleToggle = async (competitor: Competitor) => {
    const newStatus = !competitor.is_active;
    // 1. Anında UI güncelle
    setCompetitors((prev) =>
      prev.map((c) => (c.id === competitor.id ? { ...c, is_active: newStatus } : c))
    );
    try {
      await updateCompetitorStatus(competitor.id, newStatus);
    } catch {
      // 2. Rollback
      setCompetitors((prev) =>
        prev.map((c) => (c.id === competitor.id ? { ...c, is_active: competitor.is_active } : c))
      );
      Alert.alert('Bağlantı Hatası', 'Durum geri alındı. İnternet bağlantınızı kontrol edin.');
    }
  };

  // ── Silme ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteCompetitor(deleteTarget.id);
    setDeleteTarget(null);
    await loadData();
  };

  // ── Mobil Backend Görevi 2: Sync bitince Pull-to-Refresh emit ─────────────
  const handleSyncComplete = () => {
    loadData(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Rakipler yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#6366f1" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Rakip Analizi
          </Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {product?.name}
          </Text>
        </View>
        <SyncButton onSyncComplete={handleSyncComplete} />
      </View>

      {/* Fiyat bilgi şeridi */}
      <View style={styles.infoBar}>
        <View style={styles.infoChip}>
          <Text style={styles.infoLabel}>Satış Fiyatımız</Text>
          <Text style={styles.infoValue}>
            {product
              ? `${Number(product.current_price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`
              : '—'}
          </Text>
        </View>
        <View style={styles.separator} />
        <Text style={styles.infoCount}>{competitors.length} Rakip</Text>

        {/* Swipe ipucu */}
        <View style={styles.swipeHint}>
          <Ionicons name="swap-horizontal" size={12} color="#94a3b8" />
          <Text style={styles.swipeHintText}>kaydır → sil</Text>
        </View>
      </View>

      {/* Liste */}
      <FlatList
        data={competitors}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CompetitorCard
            competitor={item}
            product={product}
            onToggle={handleToggle}
            onDeleteRequest={setDeleteTarget}
            onHistoryPress={(id) => router.push(`/history/${id}`)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            tintColor="#6366f1"
            colors={['#6366f1']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="people-outline" size={52} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Henüz rakip tanımlanmadı</Text>
            <Text style={styles.emptyBody}>
              Piyasadaki fiyatları takip etmek için rakip ekleyin.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Rakip ekle FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setAddModalVisible(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modaller */}
      <AddCompetitorModal
        visible={addModalVisible}
        productName={product?.name ?? ''}
        onClose={() => setAddModalVisible(false)}
        onSubmit={handleAdd}
      />
      <DeleteConfirmModal
        visible={!!deleteTarget}
        sellerName={deleteTarget?.seller_name ?? ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#f8fafc',
    gap: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1 },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSub: {
    fontSize: 11,
    color: '#6366f1',
    fontWeight: '600',
    marginTop: 1,
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  infoChip: { gap: 1 },
  infoLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '600' },
  infoValue: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
  separator: { width: 1, height: 24, backgroundColor: '#e2e8f0' },
  infoCount: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  swipeHintText: { fontSize: 10, color: '#94a3b8', fontWeight: '500' },
  list: { paddingHorizontal: 16, paddingBottom: 100, gap: 0 },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { fontSize: 14, color: '#94a3b8', fontWeight: '600', marginTop: 8 },
  emptyBox: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#475569', marginTop: 8 },
  emptyBody: { fontSize: 13, color: '#94a3b8', textAlign: 'center', lineHeight: 19 },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
});

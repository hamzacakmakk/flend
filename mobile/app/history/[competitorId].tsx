// HistoryScreen — Mobil Frontend Görevi 2 + Mobil Backend Görevi 1
// GET /competitors/{competitorId}/history
// JSON → DataPoint[] parse + PriceChart + istatistik kartları

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getCompetitorHistory, DataPoint } from '../../lib/api';
import PriceChart from '../../components/PriceChart';

export default function HistoryScreen() {
  const { competitorId } = useLocalSearchParams<{ competitorId: string }>();
  const router = useRouter();
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mobil Backend Görevi 1: JSON parse → DataPoint modeli (api.ts'de yapılıyor)
    getCompetitorHistory(competitorId)
      .then(setData)
      .catch(() => Alert.alert('Hata', 'Fiyat geçmişi yüklenemedi.'))
      .finally(() => setLoading(false));
  }, [competitorId]);

  // İstatistikler
  const prices = data.map((d) => d.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const latestPrice = prices.length > 0 ? prices[prices.length - 1] : 0;
  const oldestPrice = prices.length > 0 ? prices[0] : 0;
  const netChange = latestPrice - oldestPrice;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Grafik çiziliyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#6366f1" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Fiyat Geçmişi</Text>
          <Text style={styles.headerSub}>Rakip fiyat analizi</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* İstatistik kartları */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Güncel"
            value={`${latestPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`}
            icon="flash"
            color="#6366f1"
            bg="#eef2ff"
          />
          <StatCard
            label="En Düşük"
            value={`${minPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`}
            icon="trending-down"
            color="#10b981"
            bg="#d1fae5"
          />
          <StatCard
            label="En Yüksek"
            value={`${maxPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`}
            icon="trending-up"
            color="#ef4444"
            bg="#fee2e2"
          />
          <StatCard
            label="Net Değişim"
            value={`${netChange > 0 ? '+' : ''}${netChange.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`}
            icon={netChange < 0 ? 'arrow-down' : netChange > 0 ? 'arrow-up' : 'remove'}
            color={netChange < 0 ? '#10b981' : netChange > 0 ? '#ef4444' : '#64748b'}
            bg={netChange < 0 ? '#d1fae5' : netChange > 0 ? '#fee2e2' : '#f1f5f9'}
          />
        </View>

        {/* Grafik başlığı */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Fiyat Trendi</Text>
          <Text style={styles.sectionBadge}>{data.length} Kayıt</Text>
        </View>

        {/* Mobil Frontend Görevi 2: Mobil Çizgi Grafik */}
        <View style={styles.chartWrap}>
          <PriceChart data={data} color="#6366f1" />
        </View>

        {/* Log tablosu */}
        {data.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tarihsel Kayıtlar</Text>
            </View>
            <View style={styles.logTable}>
              <View style={styles.logHeader}>
                <Text style={[styles.logCol, { flex: 2 }]}>Tarih</Text>
                <Text style={[styles.logCol, { flex: 1, textAlign: 'right' }]}>Fiyat</Text>
                <Text style={[styles.logCol, { flex: 1, textAlign: 'right' }]}>Fark</Text>
              </View>
              {[...data].reverse().map((d, i, arr) => {
                const prev = arr[i + 1];
                const diff = prev ? d.price - prev.price : 0;
                return (
                  <View key={i} style={[styles.logRow, i % 2 === 0 && styles.logRowAlt]}>
                    <Text style={[styles.logCell, { flex: 2 }]}>{d.date}</Text>
                    <Text style={[styles.logCellBold, { flex: 1, textAlign: 'right' }]}>
                      {d.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </Text>
                    <Text
                      style={[
                        styles.logCellDiff,
                        {
                          flex: 1,
                          textAlign: 'right',
                          color:
                            diff < 0 ? '#10b981' : diff > 0 ? '#ef4444' : '#94a3b8',
                        },
                      ]}
                    >
                      {diff !== 0
                        ? `${diff > 0 ? '+' : ''}${diff.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`
                        : '—'}
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  bg,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
  bg: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  headerSub: { fontSize: 11, color: '#6366f1', fontWeight: '600', marginTop: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 40, gap: 16 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    gap: 6,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366f1',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  chartWrap: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  logTable: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  logHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  logCol: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  logRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  logRowAlt: { backgroundColor: '#fafbfc' },
  logCell: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  logCellBold: { fontSize: 12, color: '#0f172a', fontWeight: '700' },
  logCellDiff: { fontSize: 12, fontWeight: '700' },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#94a3b8', fontWeight: '600', marginTop: 8 },
});

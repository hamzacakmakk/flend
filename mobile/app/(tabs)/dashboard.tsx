// Panel sekmesi — Nurullah (25 özet istatistik, 26 kampanya önerileri)
// GET /api/dashboard/stats + GET /api/analytics/suggestions
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getDashboardStats, getSuggestions, DashboardStats, CampaignSuggestion } from '../../lib/api';
import { useAuth } from '../../lib/auth/AuthContext';
import { colors } from '../../lib/theme';
import { formatTRY, formatNumber } from '../../lib/format';
import { LoadingScreen, ErrorView, StatCard, SectionTitle, Card } from '../../components/ui';

const priorityColor: Record<string, string> = {
  critical: colors.danger, high: colors.warning, medium: colors.primary, low: colors.faint,
};

export default function DashboardTab() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [suggestions, setSuggestions] = useState<CampaignSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [s, c] = await Promise.all([getDashboardStats(), getSuggestions()]);
      setStats(s);
      setSuggestions(c);
      setError('');
    } catch (e: any) {
      setError(e?.message || 'Panel yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <LoadingScreen text="Panel yükleniyor..." />;
  if (error) return <View style={styles.safe}><ErrorView message={error} onRetry={() => load()} /></View>;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <View style={styles.header}>
        <View>
          <Text style={styles.hi}>Merhaba 👋</Text>
          <Text style={styles.company}>{user?.company_name || user?.email || 'Satıcı'}</Text>
        </View>
        <TouchableOpacity style={styles.avatar} onPress={() => router.push('/profile')} activeOpacity={0.85}>
          <Text style={styles.avatarText}>{(user?.company_name || user?.email || 'F').charAt(0).toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[colors.primary]} tintColor={colors.primary} />}
      >
        <View style={styles.statsGrid}>
          <StatCard label="BuyBox Kazanma" value={`%${formatNumber(stats?.buybox_win_rate)}`} accent={colors.success} />
          <StatCard label="Takip Edilen Ürün" value={formatNumber(stats?.tracked_products_count)} accent={colors.primary} />
          <StatCard label="Toplam Satış" value={formatNumber(stats?.total_sales)} accent={colors.accent} />
          <StatCard label="Aktif Kampanya" value={formatNumber(stats?.active_campaigns)} accent={colors.warning} />
        </View>
        <Card style={{ marginTop: 4 }}>
          <Text style={styles.revLabel}>Toplam Ciro</Text>
          <Text style={styles.revValue}>{formatTRY(stats?.revenue)}</Text>
        </Card>

        <View style={{ marginTop: 20 }}>
          <SectionTitle title="Stok Eritme / Kampanya Önerileri" count={suggestions.length} />
          {suggestions.length === 0 ? (
            <Card><Text style={styles.muted}>Şu an öneri yok.</Text></Card>
          ) : (
            suggestions.map((s) => (
              <Card key={s.id} style={{ marginBottom: 10 }}>
                <View style={styles.sugRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sugName} numberOfLines={1}>{s.product_name}</Text>
                    <Text style={styles.sugMeta}>Stok: {formatNumber(s.current_stock)} • ~{s.days_of_stock} gün • {s.suggestion_type}</Text>
                  </View>
                  <View style={[styles.prio, { backgroundColor: (priorityColor[s.priority] || colors.faint) + '22' }]}>
                    <Text style={[styles.prioText, { color: priorityColor[s.priority] || colors.faint }]}>%{formatNumber(s.suggested_discount)} indir</Text>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  hi: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  company: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  scroll: { paddingHorizontal: 20, paddingBottom: 28 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  revLabel: { fontSize: 12, color: colors.faint, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  revValue: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 4 },
  muted: { color: colors.muted, fontSize: 13 },
  sugRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sugName: { fontSize: 14, fontWeight: '700', color: colors.text },
  sugMeta: { fontSize: 11, color: colors.faint, fontWeight: '600', marginTop: 3 },
  prio: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  prioText: { fontSize: 11, fontWeight: '800' },
});

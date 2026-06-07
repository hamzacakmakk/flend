// Kurallar sekmesi — Kadir (21 listeleme) → /pricing-new, /pricing-rule/[id], /pricing-assign
// GET /api/pricing-rules
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getPricingRules, PricingRule } from '../../lib/api';
import { colors } from '../../lib/theme';
import { formatNumber } from '../../lib/format';
import { LoadingScreen, ErrorView, EmptyState, Badge } from '../../components/ui';

export default function PricingTab() {
  const router = useRouter();
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      setRules(await getPricingRules());
      setError('');
    } catch (e: any) {
      setError(e?.message || 'Kurallar yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <LoadingScreen text="Kurallar yükleniyor..." />;
  if (error) return <View style={styles.safe}><ErrorView message={error} onRetry={() => load()} /></View>;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Fiyat Kuralları</Text>
          <Text style={styles.sub}>{rules.length} aktif kural</Text>
        </View>
      </View>

      <FlatList
        data={rules}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[colors.primary]} tintColor={colors.primary} />}
        ListEmptyComponent={<EmptyState icon="options-outline" title="Kural yok" body="Yeni bir dinamik fiyatlandırma kuralı oluşturun." />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isComp = item.rule_type === 'COMPETITOR_BASED';
          return (
            <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => router.push(`/pricing-rule/${item.id}`)}>
              <View style={{ flex: 1, gap: 8 }}>
                <Text style={styles.name}>{item.rule_name}</Text>
                <View style={styles.tagRow}>
                  <Badge text={isComp ? 'Rakip Bazlı' : 'Marj Bazlı'} color={isComp ? colors.primary : colors.accent} bg={(isComp ? colors.primary : colors.accent) + '18'} />
                  <Badge text={`${formatNumber(item.value)} ${item.unit}`} color={colors.success} bg={colors.successBg} />
                  <Badge text={`${item.assignments?.length ?? 0} atama`} color={colors.muted} bg={colors.borderLight} />
                </View>
              </View>
              <TouchableOpacity style={styles.assignBtn} onPress={() => router.push(`/pricing-assign?ruleId=${item.id}&ruleName=${encodeURIComponent(item.rule_name)}`)}>
                <Ionicons name="git-branch-outline" size={14} color={colors.primary} />
                <Text style={styles.assignText}>Ata</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/pricing-new')} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  sub: { fontSize: 12, color: colors.muted, fontWeight: '600', marginTop: 2 },
  list: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 100, gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 18, padding: 16, gap: 12, borderWidth: 1, borderColor: colors.borderLight, shadowColor: '#64748b', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  name: { fontSize: 15, fontWeight: '800', color: colors.text },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  assignBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surfaceAlt, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  assignText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 58, height: 58, borderRadius: 29, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 10 },
});

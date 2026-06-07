// Kural Atama — Kadir (20) — POST /api/pricing-rules/:ruleId/assign
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getProducts, assignPricingRule, Product } from '../lib/api';
import { colors } from '../lib/theme';
import { formatTRY } from '../lib/format';
import { ScreenHeader, PrimaryButton, LoadingScreen, EmptyState } from '../components/ui';

export default function PricingAssignScreen() {
  const { ruleId, ruleName } = useLocalSearchParams<{ ruleId: string; ruleName?: string }>();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => Alert.alert('Hata', 'Ürünler yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));
  const chosen = Object.keys(selected).filter((k) => selected[k]);

  const submit = async () => {
    if (chosen.length === 0) { Alert.alert('Uyarı', 'En az bir ürün seçin.'); return; }
    setSaving(true);
    try {
      await assignPricingRule(ruleId, { targetType: 'PRODUCT', targetIds: chosen });
      Alert.alert('Başarılı', `${chosen.length} ürüne kural atandı.`, [{ text: 'Tamam', onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert('Hata', e?.message || 'Atama başarısız.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingScreen text="Ürünler yükleniyor..." />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Kural Ata" subtitle={ruleName ? String(ruleName) : 'Hedef ürünleri seçin'} onBack={() => router.back()} />
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="cube-outline" title="Ürün yok" />}
        renderItem={({ item }) => {
          const on = !!selected[item.id];
          return (
            <TouchableOpacity style={[styles.row, on && styles.rowOn]} activeOpacity={0.8} onPress={() => toggle(item.id)}>
              <View style={[styles.check, on && styles.checkOn]}>
                {on ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.price}>{formatTRY(item.current_price)}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
      <View style={styles.footer}>
        <PrimaryButton title={`Seçilenleri Ata (${chosen.length})`} onPress={submit} loading={saving} icon="git-branch-outline" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  list: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 16, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: colors.borderLight },
  rowOn: { borderColor: colors.primary, backgroundColor: '#fbfbff' },
  check: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  name: { fontSize: 14, fontWeight: '700', color: colors.text },
  price: { fontSize: 12, color: colors.muted, fontWeight: '600', marginTop: 2 },
  footer: { padding: 20, paddingTop: 8 },
});

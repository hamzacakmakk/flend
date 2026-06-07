// Abonelik Paketleri — Tufan (6) — GET /api/subscriptions/plans
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../lib/auth/AuthContext';
import { getSubscriptionPlans, SubscriptionPackage } from '../lib/api';
import { colors } from '../lib/theme';
import { formatTRY } from '../lib/format';
import { ScreenHeader, LoadingScreen, ErrorView, Badge } from '../components/ui';

export default function SubscriptionsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getSubscriptionPlans()
      .then(setPlans)
      .catch((e) => setError(e?.message || 'Paketler yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen text="Paketler yükleniyor..." />;
  if (error) return <View style={styles.safe}><ScreenHeader title="Abonelik" onBack={() => router.back()} /><ErrorView message={error} /></View>;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Abonelik Paketleri" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {plans.map((p) => {
          const current = p.id === user?.subscription_package_id;
          return (
            <View key={p.id} style={[styles.card, current && styles.cardCurrent]}>
              <View style={styles.cardHead}>
                <Text style={styles.planName}>{p.name}</Text>
                {current ? <Badge text="Mevcut Plan" color={colors.success} bg={colors.successBg} /> : null}
              </View>
              <Text style={styles.price}>
                {Number(p.price) === 0 ? 'Ücretsiz' : formatTRY(p.price)}
                <Text style={styles.period}> / {p.period === 'yearly' ? 'yıl' : p.period === 'monthly' ? 'ay' : ''}</Text>
              </Text>
              <View style={styles.features}>
                {(p.features || []).map((f, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingTop: 4, gap: 14 },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, borderWidth: 1.5, borderColor: colors.borderLight },
  cardCurrent: { borderColor: colors.success },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  planName: { fontSize: 18, fontWeight: '800', color: colors.text },
  price: { fontSize: 24, fontWeight: '800', color: colors.primary },
  period: { fontSize: 13, fontWeight: '600', color: colors.faint },
  features: { marginTop: 14, gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 13, color: colors.muted, fontWeight: '600' },
});

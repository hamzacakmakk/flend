// Yeni Fiyat Kuralı — Kadir (19) — POST /api/pricing-rules
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { createPricingRule, RuleType, RuleUnit } from '../lib/api';
import { colors } from '../lib/theme';
import { ScreenHeader, Card, FormInput, OptionPicker, PrimaryButton } from '../components/ui';

export default function PricingNewScreen() {
  const router = useRouter();
  const [ruleName, setRuleName] = useState('');
  const [ruleType, setRuleType] = useState<RuleType>('COMPETITOR_BASED');
  const [value, setValue] = useState('1');
  const [unit, setUnit] = useState<RuleUnit>('TRY');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!ruleName.trim()) { Alert.alert('Hata', 'Kural adı zorunludur.'); return; }
    const v = Number(value);
    if (Number.isNaN(v)) { Alert.alert('Hata', 'Değer sayısal olmalı.'); return; }
    setLoading(true);
    try {
      await createPricingRule({ ruleName: ruleName.trim(), ruleType, value: v, unit });
      router.back();
    } catch (e: any) {
      Alert.alert('Hata', e?.message || 'Kural oluşturulamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Yeni Fiyat Kuralı" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Card>
          <FormInput label="Kural Adı" value={ruleName} onChangeText={setRuleName} placeholder="Örn: Rakip Altı 1 TL" />
          <OptionPicker<RuleType>
            label="Kural Tipi"
            value={ruleType}
            onChange={setRuleType}
            options={[
              { label: 'Rakip Bazlı', value: 'COMPETITOR_BASED' },
              { label: 'Marj Bazlı', value: 'MARGIN_BASED' },
            ]}
          />
          <FormInput label="Değer" value={value} onChangeText={setValue} placeholder="1" keyboardType="numeric" />
          <OptionPicker<RuleUnit>
            label="Birim"
            value={unit}
            onChange={setUnit}
            options={[
              { label: 'TL', value: 'TRY' },
              { label: 'Yüzde (%)', value: '%' },
            ]}
          />
          <Text style={styles.hint}>
            {ruleType === 'COMPETITOR_BASED'
              ? 'En düşük rakip fiyatının altına belirtilen değer kadar inilir.'
              : 'Maliyet eşiği (min. fiyat) üzerine belirtilen kâr marjı eklenir.'}
          </Text>
          <PrimaryButton title="Kuralı Oluştur" onPress={submit} loading={loading} icon="add-circle-outline" />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingTop: 4 },
  hint: { fontSize: 12, color: colors.muted, lineHeight: 17, marginBottom: 14 },
});

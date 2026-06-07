// Fiyat Kuralı Düzenle/Sil — Kadir (23 güncelle, 24 sil)
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getPricingRules, updatePricingRule, deletePricingRule, RuleType, RuleUnit } from '../../lib/api';
import { colors } from '../../lib/theme';
import { ScreenHeader, Card, FormInput, OptionPicker, PrimaryButton, LoadingScreen } from '../../components/ui';

export default function PricingRuleEditScreen() {
  const { ruleId } = useLocalSearchParams<{ ruleId: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ruleName, setRuleName] = useState('');
  const [ruleType, setRuleType] = useState<RuleType>('COMPETITOR_BASED');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<RuleUnit>('TRY');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPricingRules()
      .then((rules) => {
        const r = rules.find((x) => x.id === ruleId);
        if (r) {
          setRuleName(r.rule_name);
          setRuleType(r.rule_type);
          setValue(String(r.value));
          setUnit(r.unit);
        }
      })
      .catch(() => Alert.alert('Hata', 'Kural yüklenemedi.'))
      .finally(() => setLoading(false));
  }, [ruleId]);

  const save = async () => {
    const v = Number(value);
    if (!ruleName.trim() || Number.isNaN(v)) { Alert.alert('Hata', 'Geçerli kural adı ve değer girin.'); return; }
    setSaving(true);
    try {
      await updatePricingRule(ruleId, { ruleName: ruleName.trim(), ruleType, value: v, unit });
      router.back();
    } catch (e: any) {
      Alert.alert('Hata', e?.message || 'Güncellenemedi.');
    } finally {
      setSaving(false);
    }
  };

  const remove = () => {
    Alert.alert('Kuralı Sil', 'Bu fiyat kuralı silinsin mi?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive', onPress: async () => {
          try { await deletePricingRule(ruleId); router.back(); }
          catch (e: any) { Alert.alert('Hata', e?.message || 'Silinemedi.'); }
        },
      },
    ]);
  };

  if (loading) return <LoadingScreen text="Kural yükleniyor..." />;

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Kuralı Düzenle" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Card>
          <FormInput label="Kural Adı" value={ruleName} onChangeText={setRuleName} />
          <OptionPicker<RuleType>
            label="Kural Tipi" value={ruleType} onChange={setRuleType}
            options={[{ label: 'Rakip Bazlı', value: 'COMPETITOR_BASED' }, { label: 'Marj Bazlı', value: 'MARGIN_BASED' }]}
          />
          <FormInput label="Değer" value={value} onChangeText={setValue} keyboardType="numeric" />
          <OptionPicker<RuleUnit>
            label="Birim" value={unit} onChange={setUnit}
            options={[{ label: 'TL', value: 'TRY' }, { label: 'Yüzde (%)', value: '%' }]}
          />
          <PrimaryButton title="Değişiklikleri Kaydet" onPress={save} loading={saving} icon="save-outline" />
        </Card>
        <View style={{ marginTop: 14 }}>
          <PrimaryButton title="Kuralı Sil" onPress={remove} variant="danger" icon="trash-outline" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingTop: 4 },
});

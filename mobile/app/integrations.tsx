// Pazaryeri Entegrasyonları — Mehmet (7 ekle, 11 güncelle, sil) + 8 (senkronize)
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  listIntegrations, addIntegration, updateIntegration, deleteIntegration, syncIntegration, Integration,
} from '../lib/api';
import { colors } from '../lib/theme';
import { ScreenHeader, Card, FormInput, PrimaryButton, Badge, EmptyState } from '../components/ui';

export default function IntegrationsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Integration[]>([]);
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [adding, setAdding] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try { setItems(await listIntegrations()); } catch { /* yoksay */ }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const add = async () => {
    if (!name.trim() || !apiKey.trim()) { Alert.alert('Hata', 'Pazaryeri adı ve API Key zorunludur.'); return; }
    setAdding(true);
    try {
      await addIntegration({ marketplace_name: name.trim(), api_key: apiKey.trim(), api_secret: apiSecret.trim() || undefined });
      setName(''); setApiKey(''); setApiSecret('');
      load();
    } catch (e: any) {
      Alert.alert('Hata', e?.message || 'Eklenemedi.');
    } finally {
      setAdding(false);
    }
  };

  const sync = async (it: Integration) => {
    setSyncingId(it.id);
    try {
      const r = await syncIntegration(it.id);
      Alert.alert('Senkronizasyon', `${r.count} ürün çekildi (${r.marketplace}). Envanter sekmesinden görebilirsiniz.`);
    } catch (e: any) {
      Alert.alert('Hata', e?.message || 'Senkronize edilemedi.');
    } finally {
      setSyncingId(null);
    }
  };

  const toggleStatus = async (it: Integration) => {
    const next = it.status === 'active' ? 'inactive' : 'active';
    try {
      await updateIntegration(it.id, { status: next });
      load();
    } catch (e: any) {
      Alert.alert('Hata', e?.message || 'Güncellenemedi.');
    }
  };

  const remove = (it: Integration) => {
    Alert.alert('Sil', `${it.marketplace_name} entegrasyonu silinsin mi?`, [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => { try { await deleteIntegration(it.id); await load(); } catch (e: any) { Alert.alert('Hata', e?.message); } } },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Pazaryeri Entegrasyonları" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* 7. Ekle */}
        <Card>
          <Text style={styles.cardTitle}>Yeni Entegrasyon Ekle</Text>
          <FormInput label="Pazaryeri Adı" value={name} onChangeText={setName} placeholder="Trendyol / Hepsiburada / Amazon" />
          <FormInput label="API Key" value={apiKey} onChangeText={setApiKey} placeholder="API anahtarı" autoCapitalize="none" />
          <FormInput label="API Secret (opsiyonel)" value={apiSecret} onChangeText={setApiSecret} placeholder="Gizli anahtar" autoCapitalize="none" />
          <PrimaryButton title="Entegrasyon Ekle" onPress={add} loading={adding} icon="add-circle-outline" />
        </Card>

        <Text style={styles.listTitle}>Bağlı Pazaryerleri</Text>
        {items.length === 0 ? (
          <EmptyState icon="link-outline" title="Henüz entegrasyon yok" body="Yukarıdan bir pazaryeri ekleyin." />
        ) : (
          items.map((it) => (
            <Card key={it.id} style={{ marginBottom: 12 }}>
              <View style={styles.itemHead}>
                <Text style={styles.mpName}>{it.marketplace_name}</Text>
                <Badge text={it.status === 'active' ? 'Aktif' : 'Pasif'} color={it.status === 'active' ? colors.success : colors.faint} bg={(it.status === 'active' ? colors.success : colors.faint) + '18'} />
              </View>
              <Text style={styles.url} numberOfLines={1}>{it.base_url}</Text>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => sync(it)} disabled={syncingId === it.id}>
                  {syncingId === it.id ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name="sync-outline" size={16} color={colors.primary} />}
                  <Text style={styles.actionText}>Ürün Çek</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => toggleStatus(it)}>
                  <Ionicons name="swap-horizontal-outline" size={16} color={colors.accent} />
                  <Text style={[styles.actionText, { color: colors.accent }]}>Durum</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => remove(it)}>
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  <Text style={[styles.actionText, { color: colors.danger }]}>Sil</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingTop: 4 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 12 },
  listTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginTop: 20, marginBottom: 12 },
  itemHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mpName: { fontSize: 16, fontWeight: '800', color: colors.text },
  url: { fontSize: 11, color: colors.faint, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.bg, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.borderLight },
  actionText: { fontSize: 12, fontWeight: '700', color: colors.primary },
});

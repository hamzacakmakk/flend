// Bildirim sekmesi — Nurullah (27 liste, 28 alarm kuralı, 29 okundu, 30 sil)
import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, RefreshControl,
  Modal, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  getNotifications, markNotificationRead, deleteNotification, createAlertRule, AppNotification,
} from '../../lib/api';
import { colors } from '../../lib/theme';
import { formatRelativeTime } from '../../lib/format';
import { LoadingScreen, ErrorView, EmptyState, FormInput, OptionPicker, PrimaryButton, SecondaryButton } from '../../components/ui';

const typeIcon: Record<string, { name: React.ComponentProps<typeof Ionicons>['name']; color: string }> = {
  success: { name: 'checkmark-circle', color: colors.success },
  warning: { name: 'alert-circle', color: colors.warning },
  error: { name: 'close-circle', color: colors.danger },
  info: { name: 'information-circle', color: colors.primary },
};

const CONDITIONS = [
  { label: 'Rakip Fiyat Düşüşü', value: 'rakip_fiyat_dususu' },
  { label: 'Stok Azalması', value: 'stok_azalmasi' },
  { label: 'BuyBox Kaybı', value: 'buybox_kaybi' },
  { label: 'Fiyat Değişimi', value: 'fiyat_degisimi' },
] as const;

export default function NotificationsTab() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      setItems(await getNotifications());
      setError('');
    } catch (e: any) {
      setError(e?.message || 'Bildirimler yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // 29. Okundu (optimistic)
  const handleRead = async (n: AppNotification) => {
    if (n.is_read) return;
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
    try {
      await markNotificationRead(n.id);
    } catch {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: false } : x)));
    }
  };

  // 30. Sil
  const handleDelete = (n: AppNotification) => {
    const prev = items;
    setItems((p) => p.filter((x) => x.id !== n.id));
    deleteNotification(n.id).catch(() => { setItems(prev); Alert.alert('Hata', 'Bildirim silinemedi.'); });
  };

  if (loading) return <LoadingScreen text="Bildirimler yükleniyor..." />;
  if (error) return <View style={styles.safe}><ErrorView message={error} onRetry={() => load()} /></View>;

  const unread = items.filter((i) => !i.is_read).length;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Bildirimler</Text>
          <Text style={styles.sub}>{unread} okunmamış</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModal(true)} activeOpacity={0.85}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addText}>Alarm</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[colors.primary]} tintColor={colors.primary} />}
        ListEmptyComponent={<EmptyState icon="notifications-off-outline" title="Bildirim yok" body="Yeni bildirimler burada listelenecek." />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const ic = typeIcon[item.type] || typeIcon.info;
          return (
            <TouchableOpacity activeOpacity={0.8} onPress={() => handleRead(item)} style={[styles.card, !item.is_read && styles.cardUnread]}>
              <View style={[styles.iconWrap, { backgroundColor: ic.color + '18' }]}>
                <Ionicons name={ic.name} size={18} color={ic.color} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[styles.cardTitle, !item.is_read && styles.bold]} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.cardBody} numberOfLines={2}>{item.message}</Text>
                <Text style={styles.time}>{formatRelativeTime(item.created_at)}</Text>
              </View>
              <TouchableOpacity hitSlop={8} onPress={() => handleDelete(item)} style={styles.trash}>
                <Ionicons name="trash-outline" size={18} color={colors.faint} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />

      <AlertRuleModal visible={modal} onClose={() => setModal(false)} onCreated={() => { setModal(false); load(true); }} />
    </SafeAreaView>
  );
}

// 28. Alarm/Bildirim kuralı oluşturma modal'ı
function AlertRuleModal({ visible, onClose, onCreated }: { visible: boolean; onClose: () => void; onCreated: () => void }) {
  const [ruleName, setRuleName] = useState('');
  const [conditionType, setConditionType] = useState<string>(CONDITIONS[0].value);
  const [threshold, setThreshold] = useState('10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!ruleName.trim()) { setError('Kural adı zorunludur'); return; }
    const tv = Number(threshold);
    if (Number.isNaN(tv)) { setError('Eşik değeri sayısal olmalı'); return; }
    setError(''); setLoading(true);
    try {
      await createAlertRule({ ruleName: ruleName.trim(), conditionType, thresholdValue: tv });
      setRuleName(''); setThreshold('10');
      onCreated();
    } catch (e: any) {
      setError(e?.message || 'Kural oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Yeni Alarm Kuralı</Text>
            <ScrollView keyboardShouldPersistTaps="handled">
              <FormInput label="Kural Adı" value={ruleName} onChangeText={setRuleName} placeholder="Örn: Rakip %10 düşerse uyar" />
              <OptionPicker label="Tetikleyici Olay" options={CONDITIONS as any} value={conditionType} onChange={setConditionType} />
              <FormInput label="Eşik Değeri (%)" value={threshold} onChangeText={setThreshold} placeholder="10" keyboardType="numeric" />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <View style={{ gap: 10, marginTop: 4 }}>
                <PrimaryButton title="Kuralı Oluştur" onPress={submit} loading={loading} icon="notifications-outline" />
                <SecondaryButton title="Vazgeç" onPress={onClose} />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  sub: { fontSize: 12, color: colors.muted, fontWeight: '600', marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12 },
  addText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  list: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 24, gap: 10 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, padding: 14, gap: 12, borderWidth: 1, borderColor: colors.borderLight },
  cardUnread: { borderColor: colors.primary + '40', backgroundColor: '#fbfbff' },
  iconWrap: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  bold: { fontWeight: '800' },
  cardBody: { fontSize: 12, color: colors.muted, lineHeight: 17 },
  time: { fontSize: 10, color: colors.faint, fontWeight: '600', marginTop: 2 },
  trash: { padding: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingBottom: 36, paddingTop: 12, maxHeight: '85%' },
  handle: { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 18 },
  error: { color: colors.danger, fontSize: 12, fontWeight: '600', marginBottom: 8 },
});

// Profil — Tufan (3 görüntüle, 5 dondur/sil) + abonelik/entegrasyon kısayolları
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../lib/auth/AuthContext';
import { deleteAccount } from '../lib/api';
import { colors } from '../lib/theme';
import { ScreenHeader, Card, Badge } from '../components/ui';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, refreshProfile } = useAuth();

  useFocusEffect(useCallback(() => { refreshProfile(); }, [refreshProfile]));

  const handleSignOut = async () => { await signOut(); router.replace('/(auth)/login'); };

  const handleFreeze = () => {
    Alert.alert('Hesabı Dondur', 'Hesabınız dondurulacak. Devam edilsin mi?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Dondur', style: 'destructive', onPress: async () => {
          try { await deleteAccount(false); await signOut(); router.replace('/(auth)/login'); }
          catch (e: any) { Alert.alert('Hata', e?.message || 'İşlem başarısız.'); }
        },
      },
    ]);
  };

  const Item = ({ icon, label, onPress, danger }: { icon: IconName; label: string; onPress: () => void; danger?: boolean }) => (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.itemIcon, { backgroundColor: (danger ? colors.danger : colors.primary) + '18' }]}>
        <Ionicons name={icon} size={18} color={danger ? colors.danger : colors.primary} />
      </View>
      <Text style={[styles.itemLabel, danger && { color: colors.danger }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.faint} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Profil" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card>
          <View style={styles.head}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{(user?.company_name || user?.email || 'F').charAt(0).toUpperCase()}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.company}>{user?.company_name || 'Firma'}</Text>
              <Text style={styles.email}>{user?.email}</Text>
            </View>
          </View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Yetkili</Text><Text style={styles.infoVal}>{user?.full_name || '—'}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Telefon</Text><Text style={styles.infoVal}>{user?.phone || '—'}</Text></View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Abonelik</Text>
            <Badge text={user?.package_name || 'Free'} color={colors.success} bg={colors.successBg} />
          </View>
        </Card>

        <View style={styles.menu}>
          <Item icon="create-outline" label="Profili / Şifreyi Düzenle" onPress={() => router.push('/profile-edit')} />
          <Item icon="card-outline" label="Abonelik Paketleri" onPress={() => router.push('/subscriptions')} />
          <Item icon="link-outline" label="Pazaryeri Entegrasyonları" onPress={() => router.push('/integrations')} />
          <Item icon="snow-outline" label="Hesabı Dondur" onPress={handleFreeze} danger />
          <Item icon="log-out-outline" label="Çıkış Yap" onPress={handleSignOut} danger />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingTop: 4 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  avatar: { width: 56, height: 56, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 22 },
  company: { fontSize: 18, fontWeight: '800', color: colors.text },
  email: { fontSize: 13, color: colors.muted, marginTop: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.borderLight },
  infoLabel: { fontSize: 13, color: colors.faint, fontWeight: '600' },
  infoVal: { fontSize: 13, color: colors.text, fontWeight: '700' },
  menu: { marginTop: 18, gap: 10 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.borderLight },
  itemIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  itemLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.text },
});

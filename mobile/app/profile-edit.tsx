// Profil Düzenle — Tufan (4) — PUT /api/users/profile
import React, { useState } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../lib/auth/AuthContext';
import { updateProfile } from '../lib/api';
import { colors } from '../lib/theme';
import { ScreenHeader, Card, FormInput, PrimaryButton } from '../components/ui';

export default function ProfileEditScreen() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const [companyName, setCompanyName] = useState(user?.company_name || '');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await updateProfile({
        companyName: companyName.trim(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        ...(password ? { password } : {}),
      });
      await refreshProfile();
      Alert.alert('Başarılı', 'Profil güncellendi.', [{ text: 'Tamam', onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert('Hata', e?.message || 'Güncellenemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Profili Düzenle" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Card>
          <FormInput label="Firma Adı" value={companyName} onChangeText={setCompanyName} />
          <FormInput label="Ad Soyad" value={fullName} onChangeText={setFullName} />
          <FormInput label="Telefon" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <FormInput label="Yeni Parola (opsiyonel)" value={password} onChangeText={setPassword} placeholder="Değiştirmek için doldurun" secureTextEntry />
          <PrimaryButton title="Kaydet" onPress={save} loading={loading} icon="save-outline" />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingTop: 4 },
});

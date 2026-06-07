// Gereksinim 1 — Yeni Satıcı Hesabı Oluşturma (POST /api/auth/register)
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth/AuthContext';
import { FormInput, PrimaryButton, ScreenHeader } from '../../components/ui';
import { colors } from '../../lib/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [form, setForm] = useState({ companyName: '', fullName: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleRegister = async () => {
    if (!form.email.trim() || form.password.length < 6) {
      setError('E-posta ve en az 6 karakterli parola zorunludur');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signUp({
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim() || undefined,
        companyName: form.companyName.trim() || undefined,
        phone: form.phone.trim() || undefined,
      });
      router.replace('/(tabs)/dashboard');
    } catch (e: any) {
      setError(e?.message || 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Kayıt Ol" subtitle="Yeni satıcı hesabı" onBack={() => router.back()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <FormInput label="Firma Adı" value={form.companyName} onChangeText={set('companyName')} placeholder="TechStore TR" />
            <FormInput label="Ad Soyad" value={form.fullName} onChangeText={set('fullName')} placeholder="Ahmet Yılmaz" />
            <FormInput label="E-posta *" value={form.email} onChangeText={set('email')} placeholder="ornek@firma.com" keyboardType="email-address" autoCapitalize="none" />
            <FormInput label="Telefon" value={form.phone} onChangeText={set('phone')} placeholder="+90 5xx xxx xx xx" keyboardType="phone-pad" />
            <FormInput label="Parola * (min 6)" value={form.password} onChangeText={set('password')} placeholder="••••••••" secureTextEntry />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PrimaryButton title="Hesap Oluştur" onPress={handleRegister} loading={loading} icon="person-add-outline" />
            <TouchableOpacity style={styles.linkRow} onPress={() => router.back()}>
              <Text style={styles.linkMuted}>Zaten hesabın var mı? </Text>
              <Text style={styles.link}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingTop: 8 },
  card: { backgroundColor: colors.surface, borderRadius: 24, padding: 22, borderWidth: 1, borderColor: colors.borderLight },
  error: { color: colors.danger, fontSize: 13, fontWeight: '600', marginBottom: 12 },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  linkMuted: { color: colors.muted, fontSize: 13 },
  link: { color: colors.primary, fontSize: 13, fontWeight: '800' },
});

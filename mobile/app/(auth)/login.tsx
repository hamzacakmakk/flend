// Gereksinim 2 — Satıcı Girişi (POST /api/auth/login)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth/AuthContext';
import { FormInput, PrimaryButton } from '../../components/ui';
import { colors } from '../../lib/theme';
import { getApiBaseUrl, saveApiBaseUrl } from '../../lib/config';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('demo@flend.com');
  const [password, setPassword] = useState('demo1234');
  const [serverUrl, setServerUrl] = useState(getApiBaseUrl());
  const [showServer, setShowServer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('E-posta ve parola zorunludur');
      return;
    }
    if (!serverUrl.trim()) {
      setError('Sunucu adresi boş olamaz');
      setShowServer(true);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await saveApiBaseUrl(serverUrl); // önce sunucu adresini uygula
      await signIn(email.trim(), password);
      router.replace('/(tabs)/dashboard');
    } catch (e: any) {
      setError(e?.message || 'Giriş başarısız — sunucu adresini kontrol edin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.logoWrap}>
            <View style={styles.logoIcon}><Text style={styles.logoLetter}>F</Text></View>
            <Text style={styles.brand}>Flend</Text>
            <Text style={styles.tag}>Rekabet & Fiyat Optimizasyonu</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Giriş Yap</Text>
            <FormInput label="E-posta" value={email} onChangeText={setEmail} placeholder="ornek@firma.com" keyboardType="email-address" autoCapitalize="none" />
            <FormInput label="Parola" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PrimaryButton title="Giriş Yap" onPress={handleLogin} loading={loading} icon="log-in-outline" />
            <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.linkMuted}>Hesabın yok mu? </Text>
              <Text style={styles.link}>Kayıt Ol</Text>
            </TouchableOpacity>
            <Text style={styles.demoHint}>Demo: demo@flend.com / demo1234</Text>
          </View>

          {/* Sunucu adresi (çalışma zamanı ayarı — tek APK her backend ile çalışır) */}
          <TouchableOpacity style={styles.serverToggle} onPress={() => setShowServer((s) => !s)} activeOpacity={0.8}>
            <Ionicons name="server-outline" size={14} color={colors.muted} />
            <Text style={styles.serverToggleText} numberOfLines={1}>Sunucu: {serverUrl || '(boş)'}</Text>
            <Ionicons name={showServer ? 'chevron-up' : 'chevron-down'} size={14} color={colors.muted} />
          </TouchableOpacity>
          {showServer ? (
            <View style={styles.serverBox}>
              <FormInput
                label="Sunucu Adresi (Backend URL)"
                value={serverUrl}
                onChangeText={setServerUrl}
                placeholder="http://192.168.1.50:5000"
                keyboardType="url"
                autoCapitalize="none"
              />
              <Text style={styles.serverHint}>
                Backend adresini girin: LAN IP (http://...:5000), tünel ya da bulut URL'si (https://...).
                Giriş yapınca cihazda kaydedilir — tek APK her ağda çalışır.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 18 },
  logoWrap: { alignItems: 'center', gap: 8 },
  logoIcon: { width: 64, height: 64, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8 },
  logoLetter: { color: '#fff', fontWeight: '800', fontSize: 30 },
  brand: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 6 },
  tag: { fontSize: 12, color: colors.accent, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  card: { backgroundColor: colors.surface, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: colors.borderLight, shadowColor: '#64748b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 18 },
  error: { color: colors.danger, fontSize: 13, fontWeight: '600', marginBottom: 12 },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  linkMuted: { color: colors.muted, fontSize: 13 },
  link: { color: colors.primary, fontSize: 13, fontWeight: '800' },
  demoHint: { textAlign: 'center', color: colors.faint, fontSize: 11, marginTop: 14 },
  serverToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.borderLight, maxWidth: '100%' },
  serverToggleText: { flex: 1, fontSize: 11, color: colors.muted, fontWeight: '600' },
  serverBox: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.borderLight },
  serverHint: { fontSize: 11, color: colors.faint, lineHeight: 16 },
});

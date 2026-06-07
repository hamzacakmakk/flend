import { Stack } from 'expo-router';
import { AuthProvider } from '../lib/auth/AuthContext';

// Kök layout — tüm route'lar otomatik keşfedilir; başlık çubukları gizli.
// (auth)/(tabs) grupları + kök detay ekranları (competitor, history, product,
// pricing-*, profile, subscriptions, integrations) bu Stack altında çalışır.
export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}

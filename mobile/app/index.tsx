import { Redirect } from 'expo-router';
import { useAuth } from '../lib/auth/AuthContext';
import { LoadingScreen } from '../components/ui';

// Auth gate — secure-store okunana kadar bekler, sonra yönlendirir.
export default function Index() {
  const { ready, token } = useAuth();
  if (!ready) return <LoadingScreen text="Flend yükleniyor..." />;
  return <Redirect href={token ? '/(tabs)/dashboard' : '/(auth)/login'} />;
}

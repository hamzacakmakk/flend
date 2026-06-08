import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ColorValue } from 'react-native';
import { useAuth } from '../../lib/auth/AuthContext';
import { colors } from '../../lib/theme';
import { LoadingScreen } from '../../components/ui';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
const icon = (name: IconName) => ({ color, size }: { color: ColorValue; size: number }) =>
  <Ionicons name={name} color={color} size={size} />;

export default function TabsLayout() {
  const { ready, token } = useAuth();
  if (!ready) return <LoadingScreen />;
  if (!token) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.faint,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.borderLight, height: 60, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Panel', tabBarIcon: icon('grid-outline') }} />
      <Tabs.Screen name="products" options={{ title: 'Ürünler', tabBarIcon: icon('cube-outline') }} />
      <Tabs.Screen name="competitors" options={{ title: 'Rakipler', tabBarIcon: icon('people-outline') }} />
      <Tabs.Screen name="pricing" options={{ title: 'Kurallar', tabBarIcon: icon('options-outline') }} />
      <Tabs.Screen name="notifications" options={{ title: 'Bildirim', tabBarIcon: icon('notifications-outline') }} />
    </Tabs>
  );
}

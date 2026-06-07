import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

import { colors } from './src/theme';
import ProductListScreen from './src/screens/ProductListScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import IntegrationsScreen from './src/screens/IntegrationsScreen';
import IntegrationFormScreen from './src/screens/IntegrationFormScreen';

const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.card },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen
            name="Products"
            component={ProductListScreen}
            options={({ navigation }) => ({
              title: 'Envanter',
              headerRight: () => (
                <TouchableOpacity
                  onPress={() => navigation.navigate('Integrations')}
                  hitSlop={10}
                >
                  <Ionicons name="link" size={22} color={colors.primary} />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="ProductDetail"
            component={ProductDetailScreen}
            options={{ title: 'Ürün Detayı' }}
          />
          <Stack.Screen
            name="Integrations"
            component={IntegrationsScreen}
            options={{ title: 'Pazaryeri Bağlantıları' }}
          />
          <Stack.Screen
            name="IntegrationForm"
            component={IntegrationFormScreen}
            options={({ route }) => ({
              title: route.params?.integration
                ? 'Bağlantıyı Yenile'
                : 'Yeni Entegrasyon',
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

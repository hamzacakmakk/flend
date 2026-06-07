// ==========================================================================
// lib/auth/tokenStore.ts — JWT saklama (React'tan bağımsız, http.ts okur)
// Native: expo-secure-store. Web: localStorage fallback.
// ==========================================================================
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'flend_token';
let memory: string | null = null;

const isWeb = Platform.OS === 'web';

export function getToken(): string | null {
  return memory;
}

export async function loadToken(): Promise<string | null> {
  try {
    memory = isWeb
      ? (typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null)
      : await SecureStore.getItemAsync(KEY);
  } catch {
    memory = null;
  }
  return memory;
}

export async function saveToken(token: string): Promise<void> {
  memory = token;
  try {
    if (isWeb) {
      if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, token);
    } else {
      await SecureStore.setItemAsync(KEY, token);
    }
  } catch {
    // bellekte zaten tutuluyor
  }
}

export async function clearToken(): Promise<void> {
  memory = null;
  try {
    if (isWeb) {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(KEY);
    } else {
      await SecureStore.deleteItemAsync(KEY);
    }
  } catch {
    // yoksay
  }
}

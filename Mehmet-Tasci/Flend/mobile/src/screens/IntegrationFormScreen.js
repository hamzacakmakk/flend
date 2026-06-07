// ============================================
// Görev 1: Pazaryeri Entegrasyon Ekranı (API Key/Secret + pazaryeri seçici)
// Görev 5: Aynı form süresi dolan token / bilgi yenileme için kullanılır
// ============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, radius } from '../theme';
import { integrationAPI, normalizeError } from '../api/client';
import { PrimaryButton, StatusBadge } from '../components/ui';

const MARKETPLACES = ['Trendyol', 'Hepsiburada', 'Amazon TR', 'Diğer'];

function Field({ label, ...props }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          color: colors.textDim,
          fontSize: 13,
          marginBottom: 6,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
      <TextInput
        placeholderTextColor={colors.textFaint}
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.md,
          color: colors.text,
          padding: 14,
          fontSize: 15,
        }}
        {...props}
      />
    </View>
  );
}

export default function IntegrationFormScreen({ route, navigation }) {
  const editing = route.params?.integration || null;

  const [marketplace, setMarketplace] = useState(
    editing?.marketplace_name || 'Trendyol'
  );
  const [apiKey, setApiKey] = useState(editing?.api_key || '');
  const [apiSecret, setApiSecret] = useState(editing?.api_secret || '');
  const [baseUrl, setBaseUrl] = useState(editing?.base_url || '');
  const [submitting, setSubmitting] = useState(false);

  const onSave = async () => {
    if (!marketplace || !apiKey.trim()) {
      Alert.alert('Eksik bilgi', 'Pazaryeri ve API Key zorunludur.');
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        // Görev 5: bilgileri/token yenile, durumu aktife çek
        await integrationAPI.update(editing.id, {
          marketplace_name: marketplace,
          api_key: apiKey.trim(),
          api_secret: apiSecret.trim() || null,
          base_url: baseUrl.trim() || null,
          status: 'active',
        });
        Alert.alert('Başarılı', 'Bağlantı bilgileri güncellendi.');
        navigation.goBack();
      } else {
        // Görev 1: yeni entegrasyon ekle
        const res = await integrationAPI.create({
          marketplace_name: marketplace,
          api_key: apiKey.trim(),
          api_secret: apiSecret.trim() || undefined,
          base_url: baseUrl.trim() || undefined,
        });
        const newId = res.data?.data?.id;
        if (newId) {
          try {
            // Ürün senkronizasyonunu kuyruğa at; arka planda işlenir (beklemeyiz)
            await integrationAPI.sync(newId);
          } catch (_) {
            /* kuyruğa atma başarısız olsa da entegrasyon eklendi */
          }
        }
        Alert.alert(
          'Başarılı',
          'Entegrasyon eklendi. Ürünler arka planda kuyruğa alındı; birazdan envanterde görünecek.'
        );
        navigation.navigate('Products');
      }
    } catch (err) {
      const e = normalizeError(err);
      Alert.alert(`Hata (${e.status || '-'})`, e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 18 }}>
        {editing && (
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: radius.md,
              padding: 14,
              marginBottom: 18,
              borderWidth: 1,
              borderColor: colors.border,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.textDim, fontSize: 13 }}>
              Mevcut durum
            </Text>
            <StatusBadge status={editing.status} />
          </View>
        )}

        {/* Pazaryeri seçici */}
        <Text
          style={{
            color: colors.textDim,
            fontSize: 13,
            marginBottom: 8,
            fontWeight: '600',
          }}
        >
          Pazaryeri
        </Text>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 18,
          }}
        >
          {MARKETPLACES.map((m) => {
            const active = marketplace === m;
            return (
              <TouchableOpacity
                key={m}
                onPress={() => setMarketplace(m)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active ? colors.primary + '22' : colors.card,
                }}
              >
                <Text
                  style={{
                    color: active ? colors.primary : colors.textDim,
                    fontWeight: '600',
                    fontSize: 13,
                  }}
                >
                  {m}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Field
          label="API Key"
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="API anahtarınızı girin"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Field
          label="Secret Key (opsiyonel)"
          value={apiSecret}
          onChangeText={setApiSecret}
          placeholder="Gizli anahtar / şifre"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
        />
        <Field
          label="API Adresi / base_url (opsiyonel)"
          value={baseUrl}
          onChangeText={setBaseUrl}
          placeholder="Boş bırakılırsa pazaryeri varsayılanı kullanılır"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <Text
          style={{
            color: colors.textFaint,
            fontSize: 12,
            marginTop: -6,
            marginBottom: 16,
            lineHeight: 18,
          }}
        >
          Test için: Pazaryeri = "Diğer", API Adresi = https://dummyjson.com
          yazıp herhangi bir API Key girin → 30 demo ürün çekilir.
        </Text>

        <View style={{ marginTop: 8 }}>
          <PrimaryButton
            title={editing ? 'Bağlantıyı Güncelle' : 'Kaydet ve Ürünleri Çek'}
            loading={submitting}
            onPress={onSave}
          />
        </View>

        <Text
          style={{
            color: colors.textFaint,
            fontSize: 12,
            marginTop: 16,
            lineHeight: 18,
          }}
        >
          Bilgiler güvenli şekilde mobil backend üzerinden kaydedilir. Hatalı
          anahtar girilirse sunucu 400/401 döner ve burada uyarı gösterilir.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

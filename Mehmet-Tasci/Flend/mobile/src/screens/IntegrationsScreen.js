// ============================================
// Görev 5 (ekran): Bağlantı Bilgilerini Yenileme Görüntüsü
//   - Durum (Aktif/Pasif/Token Süresi Dolmuş) uyarıları
//   - Yenile / Düzenle / Ürün Çek aksiyonları
//   - "+" ile yeni entegrasyon (Görev 1) ekranına geçiş
// ============================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';
import { integrationAPI, normalizeError, waitForSync } from '../api/client';
import { StatusBadge, Empty } from '../components/ui';

export default function IntegrationsScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncingId, setSyncingId] = useState(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await integrationAPI.getAll();
      setItems(res.data?.data || []);
    } catch (err) {
      Alert.alert('Hata', normalizeError(err).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onSync = async (id) => {
    setSyncingId(id);
    setSyncProgress(0);
    try {
      // 1) İşi kuyruğa at - backend hemen jobId ile döner (beklemez)
      const res = await integrationAPI.sync(id);
      const jobId = res.data?.jobId;
      if (!jobId) throw new Error('İş kimliği alınamadı');

      // 2) Worker arka planda işlerken durumu poll et
      const result = await waitForSync(jobId, {
        onProgress: (d) => setSyncProgress(d.progress || 0),
      });

      Alert.alert(
        'Senkronizasyon',
        `${result.count ?? 0} ürün sisteme aktarıldı.`
      );
    } catch (err) {
      const msg = err.response ? normalizeError(err).message : err.message;
      Alert.alert('Senkronizasyon hatası', msg);
    } finally {
      setSyncingId(null);
      setSyncProgress(0);
    }
  };

  const onDelete = (item) => {
    Alert.alert(
      'Entegrasyonu sil',
      `"${item.marketplace_name}" bağlantısı ve ona ait ürünler silinecek. Emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(item.id);
            try {
              await integrationAPI.remove(item.id);
              setItems((prev) => prev.filter((i) => i.id !== item.id));
            } catch (err) {
              Alert.alert('Silme hatası', normalizeError(err).message);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        padding: 16,
        marginVertical: 7,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: radius.md,
              backgroundColor: colors.cardAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="storefront-outline" size={20} color={colors.primary} />
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text
              style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}
            >
              {item.marketplace_name}
            </Text>
            <Text
              style={{ color: colors.textFaint, fontSize: 12, marginTop: 2 }}
            >
              {item.api_key ? item.api_key.slice(0, 14) + '…' : '—'}
            </Text>
          </View>
        </View>
        <StatusBadge status={item.status} />
      </View>

      {item.status === 'expired' && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.red + '1a',
            borderRadius: radius.sm,
            padding: 8,
            marginTop: 12,
          }}
        >
          <Ionicons name="warning-outline" size={15} color={colors.red} />
          <Text style={{ color: colors.red, fontSize: 12, marginLeft: 6 }}>
            Token süresi dolmuş. Bağlantıyı yenileyin.
          </Text>
        </View>
      )}

      <View
        style={{
          flexDirection: 'row',
          marginTop: 14,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => onSync(item.id)}
          disabled={syncingId === item.id}
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {syncingId === item.id ? (
            <ActivityIndicator size="small" color={colors.emerald} />
          ) : (
            <Ionicons name="cloud-download-outline" size={16} color={colors.emerald} />
          )}
          <Text style={{ color: colors.emerald, fontSize: 13, fontWeight: '600' }}>
            {syncingId === item.id
              ? `Kuyrukta… %${syncProgress}`
              : 'Ürün Çek'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate('IntegrationForm', { integration: item })
          }
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Ionicons name="refresh-outline" size={16} color={colors.primary} />
          <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>
            Yenile / Düzenle
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onDelete(item)}
          disabled={deletingId === item.id}
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {deletingId === item.id ? (
            <ActivityIndicator size="small" color={colors.red} />
          ) : (
            <Ionicons name="trash-outline" size={16} color={colors.red} />
          )}
          <Text style={{ color: colors.red, fontSize: 13, fontWeight: '600' }}>
            Sil
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {loading ? (
        <ActivityIndicator
          color={colors.primary}
          size="large"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 14, paddingBottom: 90 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <Empty
              icon={
                <Ionicons name="link-outline" size={48} color={colors.textFaint} />
              }
              title="Henüz bağlantı yok"
              subtitle="Pazaryeri API bilgilerinizi ekleyin"
            />
          }
        />
      )}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('IntegrationForm')}
        style={{
          position: 'absolute',
          right: 20,
          bottom: 24,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 20,
          height: 52,
          borderRadius: 26,
          backgroundColor: colors.primary,
          elevation: 6,
        }}
      >
        <Ionicons name="add" size={22} color="#fff" />
        <Text style={{ color: '#fff', fontWeight: '700' }}>API Ekle</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================
// Görev 3: Ürün Detay Aksiyon Sayfası
//   - Stok durumu ilerleme göstergesi
//   - Güncel fiyat metni, ürün isim kartı (geri butonu header'da)
// Görev 4: Minimum fiyat güncelleme modal'ını açar
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';
import { inventoryAPI, normalizeError } from '../api/client';
import { PrimaryButton, formatPrice } from '../components/ui';
import MinPriceSheet from '../components/MinPriceSheet';

function Row({ label, value, valueColor }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Text style={{ color: colors.textDim, fontSize: 14 }}>{label}</Text>
      <Text
        style={{
          color: valueColor || colors.text,
          fontSize: 14,
          fontWeight: '600',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const STOCK_TARGET = 50; // ilerleme çubuğu referans değeri

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const res = await inventoryAPI.getProduct(productId);
      setProduct(res.data?.data || null);
    } catch (err) {
      Alert.alert('Hata', normalizeError(err).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [productId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const saveMinPrice = async (value) => {
    setSaving(true);
    try {
      await inventoryAPI.updateMinPrice(productId, value);
      setSheetOpen(false);
      await fetch();
      Alert.alert('Başarılı', 'Minimum satış fiyatı güncellendi');
    } catch (err) {
      Alert.alert('Hata', normalizeError(err).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ActivityIndicator
        color={colors.primary}
        size="large"
        style={{ marginTop: 60 }}
      />
    );
  }

  if (!product) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.textDim }}>Ürün bulunamadı</Text>
      </View>
    );
  }

  const stock = product.stock_quantity || 0;
  const ratio = Math.max(0, Math.min(1, stock / STOCK_TARGET));
  const stockColor =
    stock === 0 ? colors.red : stock < 10 ? colors.amber : colors.emerald;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetch();
          }}
          tintColor={colors.primary}
        />
      }
    >
      {/* Ürün isim kartı */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: radius.lg,
          padding: 18,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: radius.md,
              backgroundColor: colors.cardAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="cube" size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text
              style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}
            >
              {product.title}
            </Text>
            <Text style={{ color: colors.textFaint, fontSize: 12, marginTop: 2 }}>
              {product.integrations?.marketplace_name || 'Pazaryeri'} ·{' '}
              {product.barcode || product.marketplace_product_id}
            </Text>
          </View>
        </View>
      </View>

      {/* Güncel fiyat */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: radius.lg,
          padding: 18,
          marginTop: 14,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text style={{ color: colors.textDim, fontSize: 13 }}>
          Güncel Satış Fiyatı
        </Text>
        <Text
          style={{
            color: colors.emerald,
            fontSize: 28,
            fontWeight: '800',
            marginTop: 6,
          }}
        >
          {formatPrice(product.sale_price, product.currency)}
        </Text>

        {/* Stok ilerleme göstergesi */}
        <View style={{ marginTop: 18 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}
          >
            <Text style={{ color: colors.textDim, fontSize: 13 }}>
              Stok Durumu
            </Text>
            <Text
              style={{ color: stockColor, fontSize: 13, fontWeight: '700' }}
            >
              {stock} adet
            </Text>
          </View>
          <View
            style={{
              height: 10,
              borderRadius: 999,
              backgroundColor: colors.cardAlt,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${ratio * 100}%`,
                height: '100%',
                backgroundColor: stockColor,
              }}
            />
          </View>
        </View>

        <View style={{ marginTop: 8 }}>
          <Row
            label="Minimum Satış Fiyatı"
            value={
              product.min_price != null
                ? formatPrice(product.min_price, product.currency)
                : 'Tanımsız'
            }
            valueColor={product.min_price != null ? colors.amber : colors.textFaint}
          />
          <Row
            label="Para Birimi"
            value={product.currency || 'TRY'}
          />
        </View>
      </View>

      {/* Aksiyonlar */}
      <View style={{ marginTop: 18, gap: 12 }}>
        <PrimaryButton
          title="Minimum Fiyatı Düzenle"
          color={colors.emerald}
          onPress={() => setSheetOpen(true)}
        />
        <PrimaryButton
          title="Takipten Çıkar"
          color={colors.red}
          onPress={() =>
            Alert.alert(
              'Takipten Çıkar',
              `"${product.title}" ürününün takibini bırakmak istediğinize emin misiniz?`,
              [
                { text: 'Vazgeç', style: 'cancel' },
                {
                  text: 'Sil',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await inventoryAPI.deleteProduct(productId);
                      navigation.goBack();
                    } catch (err) {
                      Alert.alert('Hata', normalizeError(err).message);
                    }
                  },
                },
              ]
            )
          }
        />
      </View>

      <MinPriceSheet
        visible={sheetOpen}
        product={product}
        saving={saving}
        onClose={() => setSheetOpen(false)}
        onSave={saveMinPrice}
      />
    </ScrollView>
  );
}

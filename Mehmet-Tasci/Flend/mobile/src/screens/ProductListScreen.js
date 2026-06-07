// ============================================
// Görev 2: Satıcı Ürün Listesi Ekranı
//   - Resimli kart listesi (FlatList = RecyclerView/LazyColumn karşılığı)
//   - Pull-to-refresh (RefreshControl)
//   - Sayfalama (sonsuz kaydırma)
//   - Floating Action Button -> bağlantı ayarları
// Görev 6: Swipe-to-Delete + onay Alert dialog'u
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';
import { inventoryAPI, normalizeError } from '../api/client';
import { Empty, formatPrice } from '../components/ui';

const PAGE_SIZE = 20;

export default function ProductListScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(
    async (pageNum, searchTerm, mode) => {
      try {
        const res = await inventoryAPI.getProducts({
          page: pageNum,
          limit: PAGE_SIZE,
          search: searchTerm || undefined,
        });
        const list = res.data?.data || [];
        const pg = res.data?.pagination;
        setHasNext(Boolean(pg?.hasNextPage));
        setProducts((prev) => (pageNum === 1 ? list : [...prev, ...list]));
      } catch (err) {
        const e = normalizeError(err);
        Alert.alert('Ürünler yüklenemedi', e.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    load(1, '', 'init');
  }, [load]);

  // Arama (debounce)
  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      setPage(1);
      load(1, search, 'search');
    }, 450);
    return () => clearTimeout(t);
  }, [search, load]);

  // Ekrana geri dönünce listeyi tazele (silme/güncelleme sonrası)
  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      load(1, search, 'focus');
      setPage(1);
    });
    return unsub;
  }, [navigation, search, load]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    load(1, search, 'refresh');
  };

  const onEndReached = () => {
    if (hasNext && !loadingMore && !loading) {
      setLoadingMore(true);
      const next = page + 1;
      setPage(next);
      load(next, search, 'more');
    }
  };

  // Görev 6: onay dialog'u + silme
  const confirmDelete = (product) => {
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
              await inventoryAPI.deleteProduct(product.id);
              setProducts((prev) => prev.filter((p) => p.id !== product.id));
            } catch (err) {
              Alert.alert('Hata', normalizeError(err).message);
            }
          },
        },
      ]
    );
  };

  const renderRightActions = (product) => (
    <TouchableOpacity
      onPress={() => confirmDelete(product)}
      style={{
        backgroundColor: colors.red,
        justifyContent: 'center',
        alignItems: 'center',
        width: 88,
        marginVertical: 6,
        borderRadius: radius.md,
      }}
    >
      <Ionicons name="trash-outline" size={22} color="#fff" />
      <Text style={{ color: '#fff', fontSize: 12, marginTop: 4 }}>Sil</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => {
    const stock = item.stock_quantity || 0;
    const stockColor =
      stock === 0 ? colors.red : stock < 10 ? colors.amber : colors.emerald;
    return (
      <Swipeable renderRightActions={() => renderRightActions(item)}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate('ProductDetail', { productId: item.id })
          }
          style={{
            flexDirection: 'row',
            backgroundColor: colors.card,
            borderRadius: radius.md,
            padding: 12,
            marginVertical: 6,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: radius.sm,
              backgroundColor: colors.cardAlt,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                style={{ width: 56, height: 56 }}
              />
            ) : (
              <Ionicons name="cube-outline" size={26} color={colors.textFaint} />
            )}
          </View>

          <View style={{ flex: 1, marginLeft: 12, justifyContent: 'center' }}>
            <Text
              numberOfLines={1}
              style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}
            >
              {item.title}
            </Text>
            <Text
              style={{
                color: colors.emerald,
                fontSize: 15,
                fontWeight: '700',
                marginTop: 4,
              }}
            >
              {formatPrice(item.sale_price, item.currency)}
            </Text>
          </View>

          <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
            <Text style={{ color: stockColor, fontSize: 13, fontWeight: '700' }}>
              {stock} adet
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.textFaint}
              style={{ marginTop: 6 }}
            />
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Arama */}
      <View style={{ padding: 14, paddingBottom: 4 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.card,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 12,
          }}
        >
          <Ionicons name="search" size={18} color={colors.textFaint} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Ürün ara..."
            placeholderTextColor={colors.textFaint}
            style={{
              flex: 1,
              color: colors.text,
              paddingVertical: 10,
              paddingHorizontal: 8,
            }}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          color={colors.primary}
          size="large"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 90 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <Empty
              icon={
                <Ionicons name="cube-outline" size={48} color={colors.textFaint} />
              }
              title="Ürün bulunamadı"
              subtitle="Bir pazaryeri bağlantısı ekleyip ürünleri çekin"
            />
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                color={colors.primary}
                style={{ marginVertical: 16 }}
              />
            ) : null
          }
        />
      )}

      {/* Floating Action Button -> bağlantı ayarları */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('Integrations')}
        style={{
          position: 'absolute',
          right: 20,
          bottom: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 6,
          shadowColor: colors.primary,
          shadowOpacity: 0.5,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        <Ionicons name="link" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

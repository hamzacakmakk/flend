// Mobil Frontend Görevi 3: Swipe-to-Delete + Toggle Switch
// Mobil Backend Görevi 3: Optimistic Aktif/Pasif + Rollback
// Mobil Frontend Görevi 1: Rakip Kartları + kırmızı/yeşil fiyat vurgusu

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Switch,
  Linking,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Competitor, Product } from '../lib/api';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 80;

interface Props {
  competitor: Competitor;
  product: Product | null;
  onToggle: (competitor: Competitor) => void;
  onDeleteRequest: (competitor: Competitor) => void;
  onHistoryPress: (competitorId: string) => void;
}

export default function CompetitorCard({
  competitor,
  product,
  onToggle,
  onDeleteRequest,
  onHistoryPress,
}: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [swiped, setSwiped] = useState(false);

  // ── Swipe PanResponder ─────────────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dy) < 20,
      onPanResponderMove: (_, g) => {
        if (g.dx < 0) {
          translateX.setValue(Math.max(g.dx, -SWIPE_THRESHOLD - 20));
        }
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < -SWIPE_THRESHOLD) {
          Animated.spring(translateX, {
            toValue: -SWIPE_THRESHOLD,
            useNativeDriver: true,
          }).start();
          setSwiped(true);
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          setSwiped(false);
        }
      },
    })
  ).current;

  const closeSwiped = () => {
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
    setSwiped(false);
  };

  // ── Fiyat karşılaştırma badge ─────────────────────────────────────────────
  const getPriceBadge = () => {
    if (!product || !competitor.last_price) return null;
    const myPrice = Number(product.current_price);
    const theirPrice = Number(competitor.last_price);
    if (theirPrice < myPrice)
      return { label: 'Avantajlıyız', bg: '#dcfce7', text: '#15803d' };
    if (theirPrice > myPrice)
      return { label: 'Riskli (Biz Pahalıyız)', bg: '#fee2e2', text: '#b91c1c' };
    return { label: 'Aynı Fiyat', bg: '#f1f5f9', text: '#475569' };
  };

  const badge = getPriceBadge();
  const initial = competitor.seller_name.charAt(0).toUpperCase();

  return (
    <View style={styles.wrapper}>
      {/* Swipe ile açılan kırmızı arka plan */}
      <View style={styles.deleteBackground}>
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={() => {
            closeSwiped();
            onDeleteRequest(competitor);
          }}
        >
          <Ionicons name="trash-outline" size={22} color="#fff" />
          <Text style={styles.deleteLabel}>Takibi{'\n'}Bırak</Text>
        </TouchableOpacity>
      </View>

      {/* Kart */}
      <Animated.View
        style={[
          styles.card,
          !competitor.is_active && styles.cardInactive,
          { transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Üst satır */}
        <View style={styles.row}>
          {/* Avatar */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>

          {/* İsim + Link */}
          <View style={styles.info}>
            <Text style={styles.sellerName} numberOfLines={1}>
              {competitor.seller_name}
            </Text>
            <TouchableOpacity onPress={() => Linking.openURL(competitor.competitor_url)}>
              <Text style={styles.link}>İlana Git ↗</Text>
            </TouchableOpacity>
          </View>

          {/* Mobil Backend Görevi 3: Optimistic Toggle Switch */}
          <Switch
            value={competitor.is_active}
            onValueChange={() => onToggle(competitor)}
            trackColor={{ false: '#cbd5e1', true: '#6ee7b7' }}
            thumbColor={competitor.is_active ? '#10b981' : '#94a3b8'}
            ios_backgroundColor="#cbd5e1"
          />
        </View>

        {/* Alt satır */}
        <View style={styles.bottomRow}>
          {/* Fiyat */}
          <View>
            <Text style={styles.price}>
              {competitor.last_price
                ? `${Number(competitor.last_price).toLocaleString('tr-TR', {
                    minimumFractionDigits: 2,
                  })} ₺`
                : 'Bekleniyor'}
            </Text>
            {badge && (
              <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
              </View>
            )}
          </View>

          {/* Aksiyonlar */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.historyBtn}
              onPress={() => onHistoryPress(competitor.id)}
            >
              <Ionicons name="stats-chart" size={14} color="#6366f1" />
              <Text style={styles.historyText}>Geçmiş</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.trashBtn}
              onPress={() => onDeleteRequest(competitor)}
            >
              <Ionicons name="trash-outline" size={16} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
    borderRadius: 18,
    overflow: 'hidden',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: SWIPE_THRESHOLD + 20,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  deleteAction: {
    alignItems: 'center',
    gap: 4,
  },
  deleteLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardInactive: {
    opacity: 0.55,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '800',
    fontSize: 16,
    color: '#6366f1',
  },
  info: {
    flex: 1,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  link: {
    fontSize: 11,
    color: '#6366f1',
    marginTop: 2,
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eef2ff',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  historyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366f1',
  },
  trashBtn: {
    padding: 7,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
  },
});

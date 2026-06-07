// Ortak küçük UI bileşenleri
import React from 'react';
import { Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { colors, radius } from '../theme';

export function PrimaryButton({ title, onPress, loading, disabled, color }) {
  const bg = color || colors.primary;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={{
        backgroundColor: disabled ? colors.border : bg,
        paddingVertical: 14,
        borderRadius: radius.md,
        alignItems: 'center',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const STATUS = {
  active: { label: 'Aktif', color: colors.emerald },
  expired: { label: 'Token Süresi Dolmuş', color: colors.red },
  inactive: { label: 'Pasif', color: colors.textFaint },
};

export function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.inactive;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: s.color + '22',
        borderColor: s.color + '55',
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
      }}
    >
      <View
        style={{
          width: 7,
          height: 7,
          borderRadius: 999,
          backgroundColor: s.color,
          marginRight: 6,
        }}
      />
      <Text style={{ color: s.color, fontSize: 12, fontWeight: '600' }}>
        {s.label}
      </Text>
    </View>
  );
}

export function Empty({ icon, title, subtitle }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 60 }}>
      {icon}
      <Text
        style={{
          color: colors.textDim,
          fontSize: 16,
          fontWeight: '600',
          marginTop: 12,
        }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text style={{ color: colors.textFaint, fontSize: 13, marginTop: 4 }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export function formatPrice(value, currency = 'TRY') {
  const n = Number(value || 0);
  return (
    n.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) +
    ' ' +
    (currency === 'TRY' ? '₺' : currency)
  );
}

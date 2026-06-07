// ============================================
// Görev 4: Minimum (Taban) Fiyat Güncelleme Bottom Sheet
// ============================================

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, radius } from '../theme';
import { PrimaryButton, formatPrice } from './ui';

export default function MinPriceSheet({ visible, product, onClose, onSave, saving }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (visible && product) {
      setValue(product.min_price != null ? String(product.min_price) : '');
    }
  }, [visible, product]);

  const numeric = parseFloat((value || '').replace(',', '.'));
  const valid = !isNaN(numeric) && numeric >= 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            padding: 22,
            paddingBottom: 34,
            borderTopWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 999,
              backgroundColor: colors.border,
              alignSelf: 'center',
              marginBottom: 18,
            }}
          />

          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
            Minimum Satış Fiyatı
          </Text>
          <Text style={{ color: colors.textDim, fontSize: 13, marginTop: 4 }}>
            {product?.title}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 16,
              backgroundColor: colors.cardAlt,
              borderRadius: radius.md,
              padding: 12,
            }}
          >
            <Text style={{ color: colors.textFaint, fontSize: 13 }}>
              Mevcut alt limit
            </Text>
            <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>
              {product?.min_price != null
                ? formatPrice(product.min_price, product?.currency)
                : 'Tanımsız'}
            </Text>
          </View>

          <Text
            style={{
              color: colors.textDim,
              fontSize: 13,
              marginTop: 18,
              marginBottom: 6,
            }}
          >
            Yeni minimum fiyat
          </Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            keyboardType="decimal-pad"
            placeholder="Örn. 2500"
            placeholderTextColor={colors.textFaint}
            autoFocus
            style={{
              backgroundColor: colors.cardAlt,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: radius.md,
              color: colors.text,
              fontSize: 18,
              padding: 14,
            }}
          />

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: radius.md,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.textDim, fontWeight: '600' }}>
                İptal
              </Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                title="Kaydet"
                color={colors.emerald}
                loading={saving}
                disabled={!valid}
                onPress={() => onSave(numeric)}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

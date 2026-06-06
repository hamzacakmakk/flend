// POST /competitors — Rakip Ürün Linki Ekleme Modal

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  productName: string;
  onClose: () => void;
  onSubmit: (data: { competitorUrl: string; sellerName: string }) => Promise<void>;
}

export default function AddCompetitorModal({ visible, productName, onClose, onSubmit }: Props) {
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!competitorUrl.trim()) {
      setError('Rakip ilan linki zorunludur');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSubmit({ competitorUrl: competitorUrl.trim(), sellerName: sellerName.trim() });
      setCompetitorUrl('');
      setSellerName('');
      onClose();
    } catch {
      setError('Rakip eklenemedi. Tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCompetitorUrl('');
    setSellerName('');
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.sheet}>
              {/* Handle */}
              <View style={styles.handle} />

              {/* Başlık */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.title}>Rakip Araştırması Ekle</Text>
                  <Text style={styles.subtitle} numberOfLines={1}>
                    {productName}
                  </Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                  <Ionicons name="close" size={20} color="#64748b" />
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.form}>
                <View style={styles.field}>
                  <Text style={styles.label}>Rakip İlan Linki *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="https://www.ornek.com/urun-linki"
                    placeholderTextColor="#cbd5e1"
                    value={competitorUrl}
                    onChangeText={setCompetitorUrl}
                    keyboardType="url"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Satıcı / Mağaza Adı</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ör: TeknoFırsat, Global Mağaza"
                    placeholderTextColor="#cbd5e1"
                    value={sellerName}
                    onChangeText={setSellerName}
                  />
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <View style={styles.actions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                    <Text style={styles.cancelText}>Vazgeç</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.submitBtn, loading && styles.submitDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.submitText}>Takibe Başla</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: { gap: 16 },
  field: { gap: 6 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
  },
  error: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 0.4,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  submitBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  submitDisabled: { opacity: 0.7 },
  submitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});

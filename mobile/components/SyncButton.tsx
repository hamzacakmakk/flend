// Mobil Backend Görevi 2: POST /competitors/sync async takip,
// bitişinde onSyncComplete() ile UI listesini otomatik yenile

import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { syncCompetitorPrices } from '../lib/api';

interface Props {
  onSyncComplete: () => void;
}

export default function SyncButton({ onSyncComplete }: Props) {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const result = await syncCompetitorPrices();
      console.log(`✅ ${result.count} rakip fiyatı güncellendi`);
      // Mobil Backend Görevi 2: bitişinde Pull-to-refresh emit
      onSyncComplete();
    } catch (err: any) {
      console.error('Senkronizasyon hatası:', err.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, syncing && styles.buttonDisabled]}
      onPress={handleSync}
      disabled={syncing}
      activeOpacity={0.8}
    >
      {syncing ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Ionicons name="refresh" size={16} color="#fff" />
      )}
      <Text style={styles.label}>
        {syncing ? 'Güncelleniyor...' : 'Botu Çalıştır'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10b981',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  label: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});

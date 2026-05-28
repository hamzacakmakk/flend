import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import CompetitorCard from '../components/CompetitorCard';
import { getCompetitors, syncPrices, updateStatus, deleteCompetitor } from '../api';

// Hardcoded product for demonstration, normally passed via navigation
const PRODUCT_ID = 'uid-urun-123';
const MY_PRICE = 310; 

export default function CompetitorListScreen() {
  const [competitors, setCompetitors] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [simulateOffline, setSimulateOffline] = useState(false);

  const fetchCompetitors = async () => {
    try {
      const data = await getCompetitors(PRODUCT_ID);
      setCompetitors(data);
    } catch (error) {
      Alert.alert('Hata', 'Rakipler yüklenemedi: ' + error.message);
    }
  };

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (simulateOffline) throw new Error('Çevrimdışı modu aktif');
      await syncPrices();
      await fetchCompetitors();
    } catch (error) {
      Alert.alert('Senkronizasyon Hatası', error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleStatus = async (id, isActive) => {
    // 1. Optimistic Update
    const originalCompetitors = [...competitors];
    setCompetitors(prev => prev.map(c => c.id === id ? { ...c, is_active: isActive } : c));

    try {
      // 2. Mock Offline Failure or Real API call
      if (simulateOffline) {
        throw new Error('Bağlantı koptu (Offline Simülasyonu)');
      }
      await updateStatus(id, isActive);
    } catch (error) {
      // 3. Rollback on failure
      Alert.alert('Güncelleme Başarısız', error.message + '\nDurum geri alınıyor...');
      setCompetitors(originalCompetitors);
    }
  };

  const handleDelete = async (id) => {
    try {
      if (simulateOffline) throw new Error('Çevrimdışı modda silinemez');
      await deleteCompetitor(id);
      setCompetitors(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      Alert.alert('Silme Hatası', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rakip Analizi</Text>
        <TouchableOpacity 
          style={[styles.offlineBtn, simulateOffline && styles.offlineActive]} 
          onPress={() => setSimulateOffline(!simulateOffline)}
        >
          <Text style={styles.offlineText}>
            {simulateOffline ? 'Offline (Açık)' : 'Offline (Kapalı)'}
          </Text>
        </TouchableOpacity>
      </View>

      <SwipeListView
        data={competitors}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CompetitorCard 
            competitor={item} 
            myPrice={MY_PRICE} 
            onToggleStatus={handleToggleStatus} 
          />
        )}
        renderHiddenItem={({ item }) => (
          <View style={styles.rowBack}>
            <TouchableOpacity 
              style={styles.deleteBtn} 
              onPress={() => handleDelete(item.id)}
            >
              <Text style={styles.deleteText}>Takibi Bırak</Text>
            </TouchableOpacity>
          </View>
        )}
        rightOpenValue={-100}
        disableRightSwipe
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
  },
  offlineBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
  offlineActive: {
    backgroundColor: '#ef4444',
  },
  offlineText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#ef4444',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingRight: 20,
  },
  deleteBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});

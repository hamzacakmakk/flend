import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getHistory } from '../api';

export default function CompetitorCard({ competitor, myPrice, onToggleStatus }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory(competitor.id)
      .then(data => {
        setHistory(data.map(h => Number(h.price)));
      })
      .catch(err => console.log('History error', err))
      .finally(() => setLoading(false));
  }, [competitor.id]);

  const theirPrice = Number(competitor.last_price || 0);
  const isCheaper = theirPrice > 0 && theirPrice < myPrice;
  
  const chartData = {
    datasets: [{ data: history.length > 0 ? history : [theirPrice || myPrice] }]
  };

  return (
    <View style={[styles.card, isCheaper && styles.dangerCard, !competitor.is_active && styles.inactiveCard]}>
      <View style={styles.header}>
        <Text style={styles.title}>{competitor.seller_name}</Text>
        <Switch
          value={competitor.is_active}
          onValueChange={(val) => onToggleStatus(competitor.id, val)}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={competitor.is_active ? '#2563eb' : '#f4f3f4'}
        />
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.priceText}>
          {theirPrice ? `${theirPrice.toLocaleString('tr-TR')} ₺` : 'Bekleniyor'}
        </Text>
        {isCheaper && <Text style={styles.dangerBadge}>Riskli (Biz Pahalıyız)</Text>}
      </View>
      
      <View style={styles.chartContainer}>
        {loading ? (
          <ActivityIndicator size="small" color="#2563eb" />
        ) : (
          <LineChart
            data={chartData}
            width={200}
            height={60}
            withDots={false}
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLabels={false}
            withHorizontalLabels={false}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: 'transparent',
              backgroundGradientTo: 'transparent',
              backgroundGradientFromOpacity: 0,
              backgroundGradientToOpacity: 0,
              color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
              strokeWidth: 2,
            }}
            bezier
            style={{ paddingRight: 0, paddingTop: 10, marginHorizontal: -20 }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  dangerCard: {
    borderLeftColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  inactiveCard: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  priceText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#334155',
  },
  dangerBadge: {
    marginLeft: 12,
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  chartContainer: {
    marginTop: 12,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

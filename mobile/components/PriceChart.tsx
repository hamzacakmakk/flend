// Mobil Frontend Görevi 2: Rakip fiyat eğilimlerini gösteren mobil grafik
// Mobil Backend Görevi 1: DataPoint[] modelini direkt tüketir

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { DataPoint } from '../lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 48;
const CHART_HEIGHT = 200;
const PADDING = { top: 16, bottom: 32, left: 48, right: 16 };

interface Props {
  data: DataPoint[];
  color?: string;
}

export default function PriceChart({ data, color = '#6366f1' }: Props) {
  if (!data || data.length < 2) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Henüz yeterli veri yok</Text>
      </View>
    );
  }

  const prices = data.map((d) => d.price);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;

  const plotW = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotH = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  // Koordinat hesabı
  const toX = (i: number) => PADDING.left + (i / (data.length - 1)) * plotW;
  const toY = (price: number) =>
    PADDING.top + plotH - ((price - minP) / range) * plotH;

  // SVG polyline points string
  const points = data.map((d, i) => `${toX(i)},${toY(d.price)}`).join(' ');

  // Alan dolgusu
  const areaPoints = [
    `${toX(0)},${PADDING.top + plotH}`,
    ...data.map((d, i) => `${toX(i)},${toY(d.price)}`),
    `${toX(data.length - 1)},${PADDING.top + plotH}`,
  ].join(' ');

  // Y eksen etiketleri
  const yLabels = [minP, (minP + maxP) / 2, maxP];

  // X eksen etiketleri (max 5 tane)
  const step = Math.max(1, Math.floor(data.length / 4));
  const xLabels = data.filter((_, i) => i % step === 0 || i === data.length - 1);

  return (
    <View style={styles.container}>
      {/* SVG benzeri çizim — React Native SVG'siz basit yaklaşım */}
      {/* Kütüphane bağımlılığını minimumda tutmak için Canvas/Manuel çizim */}
      <View style={{ width: CHART_WIDTH, height: CHART_HEIGHT }}>
        {/* Y ekseni kılavuz çizgileri */}
        {yLabels.map((val, i) => {
          const y = toY(val);
          return (
            <View
              key={i}
              style={[styles.gridLine, { top: y, left: PADDING.left, width: plotW }]}
            >
              <Text style={[styles.yLabel, { top: -8, left: -PADDING.left }]}>
                {val.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
              </Text>
            </View>
          );
        })}

        {/* Poligon alan rengi (basit segment blokları) */}
        {data.slice(0, -1).map((d, i) => {
          const x1 = toX(i);
          const y1 = toY(d.price);
          const x2 = toX(i + 1);
          const y2 = toY(data[i + 1].price);
          const baseY = PADDING.top + plotH;
          const w = x2 - x1;
          const avgY = (y1 + y2) / 2;
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: x1,
                top: avgY,
                width: w,
                height: baseY - avgY,
                backgroundColor: color,
                opacity: 0.08,
              }}
            />
          );
        })}

        {/* Çizgi segmentleri */}
        {data.slice(0, -1).map((d, i) => {
          const x1 = toX(i);
          const y1 = toY(d.price);
          const x2 = toX(i + 1);
          const y2 = toY(data[i + 1].price);
          const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
          const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: x1,
                top: y1,
                width: length,
                height: 2.5,
                backgroundColor: color,
                borderRadius: 2,
                transform: [{ rotate: `${angle}deg` }, { translateX: 0 }],
                transformOrigin: 'left center',
              }}
            />
          );
        })}

        {/* Veri noktaları */}
        {data.map((d, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                left: toX(i) - 5,
                top: toY(d.price) - 5,
                backgroundColor: color,
              },
            ]}
          />
        ))}

        {/* X ekseni etiketleri */}
        {xLabels.map((d, i) => {
          const idx = data.indexOf(d);
          return (
            <Text
              key={i}
              style={[
                styles.xLabel,
                { left: toX(idx) - 16, top: PADDING.top + plotH + 6 },
              ]}
            >
              {d.date}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    overflow: 'hidden',
  },
  empty: {
    height: CHART_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
  },
  emptyText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 14,
  },
  gridLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  yLabel: {
    position: 'absolute',
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    width: 44,
    textAlign: 'right',
  },
  dot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  xLabel: {
    position: 'absolute',
    fontSize: 9,
    color: '#94a3b8',
    fontWeight: '600',
    width: 32,
    textAlign: 'center',
  },
});

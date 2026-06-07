// ==========================================================================
// components/ui/index.tsx — Paylaşılan UI primitifleri (tüm yeni ekranlar)
// Mevcut renk paleti ve stil dilini korur (indigo #6366f1 vb.).
// ==========================================================================
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  StyleProp,
  ViewStyle,
  KeyboardTypeOptions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../../lib/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// ── Ekran başlığı (geri butonu + başlık + alt başlık + sağ alan) ──────────
export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <View style={s.header}>
      {onBack ? (
        <TouchableOpacity style={s.backBtn} onPress={onBack} hitSlop={10}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={s.headerTitle} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={s.headerSub} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

// ── Kart ──────────────────────────────────────────────────────────────────
export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

// ── Bölüm başlığı ──────────────────────────────────────────────────────────
export function SectionTitle({ title, count }: { title: string; count?: number }) {
  return (
    <View style={s.sectionRow}>
      <Text style={s.sectionTitle}>{title}</Text>
      {count != null ? (
        <View style={s.sectionBadge}><Text style={s.sectionBadgeText}>{count}</Text></View>
      ) : null}
    </View>
  );
}

// ── Form input (etiket + alan) ─────────────────────────────────────────────
export function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  autoCapitalize = 'sentences',
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
}) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        style={[s.input, multiline && { height: 90, textAlignVertical: 'top' }]}
        placeholder={placeholder}
        placeholderTextColor="#cbd5e1"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        multiline={multiline}
      />
    </View>
  );
}

// ── Seçim pilleri (basit dropdown alternatifi) ─────────────────────────────
export function OptionPicker<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {options.map((o) => {
          const active = o.value === value;
          return (
            <TouchableOpacity
              key={o.value}
              style={[s.pill, active && s.pillActive]}
              onPress={() => onChange(o.value)}
            >
              <Text style={[s.pillText, active && s.pillTextActive]}>{o.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ── Birincil buton (loading destekli) ──────────────────────────────────────
export function PrimaryButton({
  title,
  onPress,
  loading,
  disabled,
  icon,
  variant = 'primary',
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  variant?: 'primary' | 'danger' | 'success';
}) {
  const bg = variant === 'danger' ? colors.danger : variant === 'success' ? colors.success : colors.primary;
  return (
    <TouchableOpacity
      style={[s.btn, { backgroundColor: bg }, (disabled || loading) && { opacity: 0.6 }]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color="#fff" /> : null}
          <Text style={s.btnText}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export function SecondaryButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.secBtn} onPress={onPress} activeOpacity={0.85}>
      <Text style={s.secBtnText}>{title}</Text>
    </TouchableOpacity>
  );
}

// ── Rozet ───────────────────────────────────────────────────────────────────
export function Badge({ text, color = colors.primary, bg = colors.surfaceAlt }: { text: string; color?: string; bg?: string }) {
  return (
    <View style={[s.badge, { backgroundColor: bg }]}>
      <Text style={[s.badgeText, { color }]}>{text}</Text>
    </View>
  );
}

// ── İstatistik kartı ───────────────────────────────────────────────────────
export function StatCard({ label, value, accent = colors.primary }: { label: string; value: string; accent?: string }) {
  return (
    <View style={s.statCard}>
      <Text style={[s.statValue, { color: accent }]} numberOfLines={1}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

// ── Boş durum ───────────────────────────────────────────────────────────────
export function EmptyState({ icon = 'file-tray-outline', title, body }: { icon?: IconName; title: string; body?: string }) {
  return (
    <View style={s.emptyBox}>
      <Ionicons name={icon} size={48} color="#cbd5e1" />
      <Text style={s.emptyTitle}>{title}</Text>
      {body ? <Text style={s.emptyBody}>{body}</Text> : null}
    </View>
  );
}

// ── Yükleniyor / hata tam ekran ────────────────────────────────────────────
export function LoadingScreen({ text = 'Yükleniyor...' }: { text?: string }) {
  return (
    <View style={s.center}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={s.centerText}>{text}</Text>
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={s.center}>
      <Ionicons name="wifi-outline" size={48} color="#cbd5e1" />
      <Text style={s.centerText}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity style={s.retryBtn} onPress={onRetry}>
          <Text style={s.retryText}>Tekrar Dene</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: colors.bg,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.borderLight,
  },
  headerTitle: { fontSize: 19, fontWeight: '800', color: colors.text },
  headerSub: { fontSize: 12, color: colors.muted, fontWeight: '600', marginTop: 1 },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.card, padding: 16,
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: '#64748b', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  sectionBadge: { backgroundColor: colors.surfaceAlt, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  sectionBadgeText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  field: { gap: 6, marginBottom: 14 },
  label: { fontSize: 11, fontWeight: '700', color: colors.faint, textTransform: 'uppercase', letterSpacing: 0.8 },
  input: {
    backgroundColor: colors.bg, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.input,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontWeight: '500', color: colors.text,
  },
  pill: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: colors.bg, borderWidth: 1.5, borderColor: colors.border },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { fontSize: 13, fontWeight: '700', color: colors.muted },
  pillTextActive: { color: '#fff' },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 15, borderRadius: 14,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 4,
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secBtn: { paddingVertical: 15, borderRadius: 14, backgroundColor: colors.borderLight, alignItems: 'center' },
  secBtnText: { color: colors.muted, fontSize: 15, fontWeight: '700' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '800' },
  statCard: {
    flex: 1, minWidth: '44%', backgroundColor: colors.surface, borderRadius: radius.card, padding: 14,
    borderWidth: 1, borderColor: colors.borderLight, gap: 4,
  },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600', color: colors.faint },
  emptyBox: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#475569', marginTop: 8 },
  emptyBody: { fontSize: 13, color: colors.faint, textAlign: 'center', paddingHorizontal: 30 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40, backgroundColor: colors.bg },
  centerText: { fontSize: 14, color: colors.muted, fontWeight: '600', textAlign: 'center', marginTop: 6 },
  retryBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});

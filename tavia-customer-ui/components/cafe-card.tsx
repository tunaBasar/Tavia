import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { TenantSummary, CityDisplayLabels, SubscriptionPlan } from '@/types';

interface CafeCardProps {
  tenant: TenantSummary;
}


/** Placeholder cafe image — deterministic based on tenant name hash */
const CAFE_IMAGES = [
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=200&h=200&fit=crop',
];

function getImageForTenant(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  return CAFE_IMAGES[Math.abs(hash) % CAFE_IMAGES.length];
}

import { TouchableOpacity } from 'react-native';
import { useActiveTenantStore } from '@/store/useActiveTenantStore';
import { useThemeStore } from '@/store/useThemeStore';
import { Colors } from '@/constants/theme';

export function CafeCard({ tenant }: CafeCardProps) {
  const { theme } = useThemeStore();
  const c = Colors[theme];
  const isDark = theme === 'dark';

  const activeTenantId = useActiveTenantStore((state) => state.activeTenantId);
  const setActiveTenantId = useActiveTenantStore((state) => state.setActiveTenantId);
  const isActiveTenant = activeTenantId === tenant.id;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => setActiveTenantId(tenant.id)}
    >
      <View style={[
        styles.card,
        { backgroundColor: c.card, borderColor: c.border },
        isActiveTenant && { borderColor: c.tint, backgroundColor: isDark ? 'rgba(93,64,55,0.25)' : 'rgba(93,64,55,0.08)' },
      ]}>
        {/* Cafe Image (left) */}
        <Image
          source={{ uri: getImageForTenant(tenant.name) }}
          style={styles.image}
          contentFit="cover"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          transition={300}
        />

        {/* Info (right) */}
        <View style={styles.info}>
          <View style={styles.topRow}>
            <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>{tenant.name}</Text>
            <View style={[styles.statusDot, { backgroundColor: tenant.isActive ? '#22C55E' : '#EF4444' }]} />
          </View>

          <Text style={[styles.city, { color: c.icon }]}>📍 {CityDisplayLabels[tenant.city]}</Text>

          <View style={styles.bottomRow}>
            <Text style={[styles.statusLabel, { color: isActiveTenant ? c.tint : c.icon }]}>
              {isActiveTenant ? '✓ Selected' : (tenant.isActive ? 'Open' : 'Closed')}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: {
    width: 100,
    height: 100,
  },
  info: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  city: {
    fontSize: 13,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});

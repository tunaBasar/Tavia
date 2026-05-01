import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { TenantSummary, CityDisplayLabels, SubscriptionPlan } from '@/types';

interface CafeCardProps {
  tenant: TenantSummary;
}

const PLAN_COLORS: Record<SubscriptionPlan, string> = {
  [SubscriptionPlan.BASIC]: '#4A9EFF',
  [SubscriptionPlan.PRO]: '#A855F7',
  [SubscriptionPlan.ENTERPRISE]: '#F59E0B',
};

const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  [SubscriptionPlan.BASIC]: 'Basic',
  [SubscriptionPlan.PRO]: 'Pro',
  [SubscriptionPlan.ENTERPRISE]: 'Enterprise',
};

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

export function CafeCard({ tenant }: CafeCardProps) {
  const planColor = PLAN_COLORS[tenant.subscriptionPlan] ?? '#4A9EFF';
  const planLabel = PLAN_LABELS[tenant.subscriptionPlan] ?? tenant.subscriptionPlan;

  return (
    <View style={styles.card}>
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
          <Text style={styles.name} numberOfLines={1}>{tenant.name}</Text>
          <View style={[styles.statusDot, { backgroundColor: tenant.isActive ? '#22C55E' : '#EF4444' }]} />
        </View>

        <Text style={styles.city}>📍 {CityDisplayLabels[tenant.city]}</Text>

        <View style={styles.bottomRow}>
          <View style={[styles.planBadge, { backgroundColor: planColor + '22' }]}>
            <Text style={[styles.planText, { color: planColor }]}>{planLabel}</Text>
          </View>
          <Text style={styles.statusLabel}>{tenant.isActive ? 'Open' : 'Closed'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    color: '#FFFFFF',
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
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  planBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  planText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.35)',
  },
});

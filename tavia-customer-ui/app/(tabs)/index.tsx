import React, { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { useDiscoveryStore } from '@/store/useDiscoveryStore';
import { useThemeStore } from '@/store/useThemeStore';
import { Colors } from '@/constants/theme';
import { CitySelector } from '@/components/city-selector';
import { CafeCard } from '@/components/cafe-card';
import { TenantSummary, CityDisplayLabels } from '@/types';

export default function DiscoveryScreen() {
  const {
    selectedCity,
    tenants,
    isLoading,
    error,
    setCity,
    fetchTenants,
  } = useDiscoveryStore();
  const { theme } = useThemeStore();
  const activeColors = Colors[theme];

  // Fetch tenants whenever the selected city changes
  useEffect(() => {
    fetchTenants();
  }, [selectedCity, fetchTenants]);

  const handleRefresh = useCallback(() => {
    fetchTenants();
  }, [fetchTenants]);

  const renderCafe = useCallback(
    ({ item }: { item: TenantSummary }) => <CafeCard tenant={item} />,
    []
  );

  const keyExtractor = useCallback(
    (item: TenantSummary) => item.id,
    []
  );

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🏙️</Text>
        <Text style={styles.emptyTitle}>No cafes yet</Text>
        <Text style={styles.emptySubtitle}>
          {error
            ? `Could not load cafes. Pull down to retry.`
            : `No cafes found in ${CityDisplayLabels[selectedCity]} yet.\nCheck back soon!`}
        </Text>
      </View>
    );
  }, [isLoading, error, selectedCity]);

  return (
    <View style={[styles.root, { backgroundColor: activeColors.background }]}>
      <StatusBar style={theme === 'dark' ? "light" : "dark"} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: activeColors.text, opacity: 0.7 }]}>Good evening ☕</Text>
          <Text style={[styles.headerTitle, { color: activeColors.text }]}>Discover Cafes</Text>
          <Text style={[styles.headerSubtitle, { color: activeColors.text, opacity: 0.6 }]}>
            Find your next favorite spot in the Tavia network
          </Text>
        </View>

        {/* City Selector */}
        <CitySelector selectedCity={selectedCity} onCitySelect={setCity} />

        {/* Divider */}
        <View style={styles.divider} />

        {/* Results header */}
        <View style={styles.resultsHeader}>
          <Text style={[styles.resultsLabel, { color: activeColors.text }]}>
            Cafes in {CityDisplayLabels[selectedCity]}
          </Text>
          {!isLoading && (
            <Text style={[styles.resultsCount, { color: activeColors.text, opacity: 0.6 }]}>
              {tenants.length} {tenants.length === 1 ? 'cafe' : 'cafes'}
            </Text>
          )}
        </View>

        {/* Loading state */}
        {isLoading && tenants.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={activeColors.tint} />
            <Text style={[styles.loadingText, { color: activeColors.text, opacity: 0.6 }]}>Finding cafes…</Text>
          </View>
        ) : (
          <FlatList
            data={tenants}
            renderItem={renderCafe}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={handleRefresh}
                tintColor={activeColors.tint}
                colors={[activeColors.tint]}
              />
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.45)',
    fontWeight: '500',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 4,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginHorizontal: 16,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  resultsLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.35)',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  listContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.35)',
    textAlign: 'center',
    lineHeight: 20,
  },
});

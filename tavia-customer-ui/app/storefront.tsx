import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { useActiveTenantStore } from '@/store/useActiveTenantStore';
import { useCatalogStore } from '@/store/useCatalogStore';
import { useOrderStore } from '@/store/useOrderStore';
import { useCustomerAuthStore } from '@/store/useCustomerAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { Colors } from '@/constants/theme';
import { RecipeDto, ProductCategory, ProductCategoryLabels } from '@/types';

export default function StorefrontScreen() {
  const router = useRouter();
  const { tenantName } = useLocalSearchParams<{ tenantName: string }>();

  const { theme } = useThemeStore();
  const c = Colors[theme];

  const activeTenantId = useActiveTenantStore((s) => s.activeTenantId);
  const customer = useCustomerAuthStore((s) => s.customer);

  const { recipes, isLoading, error, fetchActiveRecipes } = useCatalogStore();
  const { placeOrder, isSubmitting } = useOrderStore();

  const [successProduct, setSuccessProduct] = useState<string | null>(null);

  useEffect(() => {
    if (activeTenantId) {
      fetchActiveRecipes();
    }
  }, [activeTenantId, fetchActiveRecipes]);

  const handleRefresh = useCallback(() => {
    fetchActiveRecipes();
  }, [fetchActiveRecipes]);

  const handleOrder = useCallback(
    async (recipe: RecipeDto) => {
      if (!customer) {
        Alert.alert('Login Required', 'Please log in to place an order.');
        return;
      }
      if (!recipe.price || recipe.price <= 0) {
        Alert.alert('Unavailable', 'Price not set for this item yet.');
        return;
      }

      const success = await placeOrder({
        customerId: customer.id,
        productName: recipe.productName,
        quantity: 1,
        price: recipe.price,
      });

      if (success) {
        setSuccessProduct(recipe.displayName);
        setTimeout(() => setSuccessProduct(null), 2500);
      } else {
        Alert.alert('Order Failed', useOrderStore.getState().error ?? 'Something went wrong.');
      }
    },
    [customer, placeOrder]
  );

  const groupedRecipes = React.useMemo(() => {
    const groups: Record<string, RecipeDto[]> = {};
    for (const recipe of recipes) {
      const key = recipe.category;
      if (!groups[key]) groups[key] = [];
      groups[key].push(recipe);
    }
    return Object.entries(groups).map(([category, items]) => ({
      category: category as ProductCategory,
      items,
    }));
  }, [recipes]);

  const renderRecipeItem = useCallback(
    (recipe: RecipeDto) => (
      <View key={recipe.id} style={[styles.menuItem, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={styles.menuItemLeft}>
          <Text style={[styles.menuItemName, { color: c.text }]}>{recipe.displayName}</Text>
          {recipe.description ? (
            <Text style={[styles.menuItemDesc, { color: c.icon }]} numberOfLines={2}>
              {recipe.description}
            </Text>
          ) : null}
          <Text style={[styles.menuItemPrice, { color: c.tint }]}>
            {recipe.price != null && recipe.price > 0
              ? `₺${recipe.price.toFixed(2)}`
              : 'Price TBD'}
          </Text>
          {/* Rating Placeholder */}
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Text key={star} style={styles.starIcon}>
                {'☆'}
              </Text>
            ))}
            <Text style={[styles.ratingLabel, { color: c.icon }]}>Coming Soon</Text>
          </View>
        </View>
        <Pressable
          style={[styles.orderButton, { backgroundColor: c.tint }]}
          onPress={() => handleOrder(recipe)}
          disabled={isSubmitting}
        >
          <Text style={styles.orderButtonText}>
            {isSubmitting ? '...' : 'Order'}
          </Text>
        </Pressable>
      </View>
    ),
    [c, handleOrder, isSubmitting]
  );

  const renderSection = useCallback(
    ({ item }: { item: { category: ProductCategory; items: RecipeDto[] } }) => (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>
          {ProductCategoryLabels[item.category] ?? item.category}
        </Text>
        {item.items.map(renderRecipeItem)}
      </View>
    ),
    [c, renderRecipeItem]
  );

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backText, { color: c.tint }]}>← Back</Text>
          </Pressable>
          <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>
            {tenantName ?? 'Cafe Menu'}
          </Text>
          <Text style={[styles.subtitle, { color: c.icon }]}>
            Menu & Ordering
          </Text>
        </View>

        {/* Success Toast */}
        {successProduct && (
          <View style={styles.toast}>
            <Text style={styles.toastText}>✓ {successProduct} ordered!</Text>
          </View>
        )}

        {/* Content */}
        {isLoading && recipes.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={c.tint} />
            <Text style={[styles.loadingText, { color: c.icon }]}>Loading menu…</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={[styles.errorText, { color: c.icon }]}>{error}</Text>
            <Pressable onPress={handleRefresh} style={[styles.retryButton, { borderColor: c.tint }]}>
              <Text style={[styles.retryText, { color: c.tint }]}>Retry</Text>
            </Pressable>
          </View>
        ) : groupedRecipes.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={[styles.emptyTitle, { color: c.text }]}>No menu items yet</Text>
            <Text style={[styles.emptySubtitle, { color: c.icon }]}>
              This cafe hasn't published their menu.
            </Text>
          </View>
        ) : (
          <FlatList
            data={groupedRecipes}
            renderItem={renderSection}
            keyExtractor={(item) => item.category}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={handleRefresh}
                tintColor={c.tint}
                colors={[c.tint]}
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
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  toast: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 32,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  menuItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '700',
  },
  menuItemDesc: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  menuItemPrice: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  starIcon: {
    fontSize: 14,
    color: '#FFB300',
    marginRight: 2,
  },
  ratingLabel: {
    fontSize: 10,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  orderButton: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  orderButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

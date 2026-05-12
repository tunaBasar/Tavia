import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { City, CityDisplayLabels } from '@/types';
import { useThemeStore } from '@/store/useThemeStore';
import { Colors } from '@/constants/theme';

const ALL_CITIES = Object.values(City);

interface CitySelectorProps {
  selectedCity: City;
  onCitySelect: (city: City) => void;
}

export function CitySelector({ selectedCity, onCitySelect }: CitySelectorProps) {
  const { theme } = useThemeStore();
  const c = Colors[theme];
  const isDark = theme === 'dark';

  return (
    <View style={styles.container}>
      <FlatList
        data={ALL_CITIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isSelected = item === selectedCity;
          return (
            <Pressable
              onPress={() => onCitySelect(item)}
              style={({ pressed }) => [
                styles.pill,
                {
                  backgroundColor: isSelected
                    ? c.tint
                    : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(93,64,55,0.08)',
                  borderColor: isSelected
                    ? c.tint
                    : isDark ? 'rgba(255,255,255,0.12)' : c.border,
                },
                pressed && styles.pillPressed,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: isSelected ? '#FFF' : c.text },
                  isSelected && styles.pillTextSelected,
                ]}
              >
                {CityDisplayLabels[item]}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
  },
  pillPressed: {
    opacity: 0.7,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pillTextSelected: {
    fontWeight: '700',
  },
});

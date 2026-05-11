import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { City, CityDisplayLabels } from '@/types';

const ALL_CITIES = Object.values(City);

interface CitySelectorProps {
  selectedCity: City;
  onCitySelect: (city: City) => void;
}

export function CitySelector({ selectedCity, onCitySelect }: CitySelectorProps) {
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
                isSelected && styles.pillSelected,
                pressed && styles.pillPressed,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  pillSelected: {
    backgroundColor: '#6B9E78',
    borderColor: '#6B9E78',
    shadowColor: '#6B9E78',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  pillPressed: {
    opacity: 0.7,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  pillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Chip, useTheme } from 'react-native-paper';
import type { Database } from '../../lib/supabase';

type Category = Database['public']['Tables']['categories']['Row'];

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId?: string;
  onCategorySelect: (categoryId: string | undefined) => void;
  showAllOption?: boolean;
  allLabel?: string;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategoryId,
  onCategorySelect,
  showAllOption = true,
  allLabel = 'All',
}) => {
  const theme = useTheme();

  const handleCategoryPress = (categoryId: string | undefined) => {
    onCategorySelect(selectedCategoryId === categoryId ? undefined : categoryId);
  };

  const isSelected = (categoryId: string | undefined) => {
    return selectedCategoryId === categoryId;
  };

  return (
    <View style={styles.container}>
      <Text
        variant="titleMedium"
        style={[styles.title, { color: theme.colors.onSurface }]}
      >
        Categories
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {showAllOption && (
          <TouchableOpacity
            onPress={() => handleCategoryPress(undefined)}
            style={styles.chipTouchable}
            accessible={true}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected(undefined) }}
            accessibilityLabel={`${allLabel} categories`}
          >
            <Chip
              mode={isSelected(undefined) ? 'flat' : 'outlined'}
              style={[
                styles.chip,
                isSelected(undefined) && {
                  backgroundColor: theme.colors.primaryContainer,
                },
              ]}
              textStyle={{
                color: isSelected(undefined)
                  ? theme.colors.onPrimaryContainer
                  : theme.colors.onSurfaceVariant,
              }}
              selected={isSelected(undefined)}
            >
              {allLabel}
            </Chip>
          </TouchableOpacity>
        )}

        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => handleCategoryPress(category.id)}
            style={styles.chipTouchable}
            accessible={true}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected(category.id) }}
            accessibilityLabel={`Category: ${category.name}`}
          >
            <Chip
              mode={isSelected(category.id) ? 'flat' : 'outlined'}
              style={[
                styles.chip,
                isSelected(category.id) && {
                  backgroundColor: theme.colors.primaryContainer,
                },
              ]}
              textStyle={{
                color: isSelected(category.id)
                  ? theme.colors.onPrimaryContainer
                  : theme.colors.onSurfaceVariant,
              }}
              selected={isSelected(category.id)}
            >
              {category.name}
            </Chip>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  title: {
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  scrollView: {
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingRight: 32, // Extra padding for last item
  },
  chipTouchable: {
    marginRight: 8,
  },
  chip: {
    height: 36,
  },
});
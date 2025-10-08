import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Searchbar, useTheme, IconButton } from 'react-native-paper';

interface ProductSearchProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  autoFocus?: boolean;
  showClearButton?: boolean;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  value,
  onChangeText,
  placeholder = 'Search products...',
  onClear,
  autoFocus = false,
  showClearButton = true,
}) => {
  const theme = useTheme();
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChangeText = (text: string) => {
    setLocalValue(text);
    onChangeText(text);
  };

  const handleClear = () => {
    setLocalValue('');
    onChangeText('');
    onClear?.();
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder={placeholder}
        onChangeText={handleChangeText}
        value={localValue}
        style={[
          styles.searchbar,
          {
            backgroundColor: theme.colors.surfaceVariant,
            borderColor: theme.colors.outline,
          },
        ]}
        inputStyle={{ color: theme.colors.onSurface }}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        iconColor={theme.colors.onSurfaceVariant}
        autoFocus={autoFocus}
        accessible={true}
        accessibilityLabel="Search products"
        accessibilityHint="Enter product name or description to search"
      />
      {showClearButton && localValue.length > 0 && (
        <View style={styles.clearButtonContainer}>
          <IconButton
            icon="close"
            size={20}
            onPress={handleClear}
            style={[
              styles.clearButton,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
            iconColor={theme.colors.onSurfaceVariant}
            accessibilityLabel="Clear search"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  searchbar: {
    borderWidth: 1,
    borderRadius: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  clearButtonContainer: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  clearButton: {
    margin: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});
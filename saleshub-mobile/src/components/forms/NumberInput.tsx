import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput as PaperTextInput, Text, HelperText, useTheme } from 'react-native-paper';

interface NumberInputProps {
  label: string;
  value: number | string;
  onChangeValue: (value: number) => void;
  error?: string;
  helperText?: string;
  placeholder?: string;
  minValue?: number;
  maxValue?: number;
  step?: number;
  precision?: number;
  prefix?: string;
  suffix?: string;
  disabled?: boolean;
  required?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChangeValue,
  error,
  helperText,
  placeholder,
  minValue,
  maxValue,
  step = 1,
  precision = 2,
  prefix,
  suffix,
  disabled = false,
  required = false,
}) => {
  const theme = useTheme();
  const [textValue, setTextValue] = useState(value.toString());

  useEffect(() => {
    setTextValue(formatNumber(value));
  }, [value, precision]);

  const displayLabel = required ? `${label} *` : label;

  const hasError = !!error;
  const showHelperText = helperText || hasError;

  const formatNumber = (num: number | string): string => {
    const numericValue = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(numericValue)) return '';

    if (precision === 0) {
      return Math.round(numericValue).toString();
    }

    return numericValue.toFixed(precision);
  };

  const parseNumber = (text: string): number => {
    const cleaned = text.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const validateAndSetValue = (text: string) => {
    setTextValue(text);

    const numericValue = parseNumber(text);

    // Apply constraints
    let constrainedValue = numericValue;

    if (minValue !== undefined && constrainedValue < minValue) {
      constrainedValue = minValue;
    }

    if (maxValue !== undefined && constrainedValue > maxValue) {
      constrainedValue = maxValue;
    }

    // Round to step
    if (step && step !== 1) {
      constrainedValue = Math.round(constrainedValue / step) * step;
    }

    onChangeValue(constrainedValue);
  };

  const increment = () => {
    const currentValue = parseNumber(textValue);
    const newValue = currentValue + step;
    if (maxValue === undefined || newValue <= maxValue) {
      onChangeValue(newValue);
    }
  };

  const decrement = () => {
    const currentValue = parseNumber(textValue);
    const newValue = currentValue - step;
    if (minValue === undefined || newValue >= minValue) {
      onChangeValue(newValue);
    }
  };

  const leftIcon = prefix ? <PaperTextInput.Affix text={prefix} /> : undefined;
  const rightIcon = suffix ? <PaperTextInput.Affix text={suffix} /> : undefined;

  return (
    <View style={styles.container}>
      <PaperTextInput
        label={displayLabel}
        value={textValue}
        onChangeText={validateAndSetValue}
        error={hasError}
        placeholder={placeholder}
        keyboardType="decimal-pad"
        disabled={disabled}
        mode="outlined"
        style={styles.input}
        left={leftIcon}
        right={rightIcon}
        theme={{
          colors: {
            primary: theme.colors.primary,
            error: theme.colors.error,
            background: theme.colors.surface,
            onSurface: theme.colors.onSurface,
            onSurfaceVariant: theme.colors.onSurfaceVariant,
          },
        }}
        accessible={true}
        accessibilityLabel={displayLabel}
        accessibilityHint={`Enter a number${minValue !== undefined ? `, minimum ${minValue}` : ''}${maxValue !== undefined ? `, maximum ${maxValue}` : ''}`}
      />

      {showHelperText && (
        <HelperText
          type={hasError ? 'error' : 'info'}
          visible={true}
          style={styles.helperText}
        >
          {error || helperText}
        </HelperText>
      )}

      {(minValue !== undefined || maxValue !== undefined) && (
        <Text
          variant="bodySmall"
          style={[styles.constraints, { color: theme.colors.onSurfaceVariant }]}
        >
          {minValue !== undefined && maxValue !== undefined
            ? `Range: ${minValue} - ${maxValue}`
            : minValue !== undefined
            ? `Min: ${minValue}`
            : `Max: ${maxValue}`}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  input: {
    backgroundColor: 'transparent',
  },
  helperText: {
    marginTop: 4,
  },
  constraints: {
    textAlign: 'right',
    marginTop: 4,
    fontSize: 12,
  },
});
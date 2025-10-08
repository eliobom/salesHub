import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput as PaperTextInput, Text, HelperText, useTheme } from 'react-native-paper';

interface TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  helperText?: string;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'decimal-pad';
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  disabled?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  required?: boolean;
  left?: React.ReactNode;
  right?: React.ReactNode;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChangeText,
  error,
  helperText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  disabled = false,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  required = false,
  left,
  right,
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const displayLabel = required ? `${label} *` : label;

  const hasError = !!error;
  const showHelperText = helperText || hasError;

  return (
    <View style={styles.container}>
      <PaperTextInput
        label={displayLabel}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        error={hasError}
        placeholder={placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        disabled={disabled}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        left={left}
        right={right}
        mode="outlined"
        style={styles.input}
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
        accessibilityHint={placeholder}
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
      {maxLength && (
        <Text
          variant="bodySmall"
          style={[styles.counter, { color: theme.colors.onSurfaceVariant }]}
        >
          {value.length}/{maxLength}
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
  counter: {
    textAlign: 'right',
    marginTop: 4,
    fontSize: 12,
  },
});
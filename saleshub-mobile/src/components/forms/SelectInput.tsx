import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Text, HelperText, TouchableRipple, useTheme } from 'react-native-paper';
import { Modal } from 'react-native';

interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectInputProps {
  label: string;
  value?: string | number;
  options: SelectOption[];
  onValueChange: (value: string | number) => void;
  error?: string;
  helperText?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  label,
  value,
  options,
  onValueChange,
  error,
  helperText,
  placeholder = 'Select an option',
  disabled = false,
  required = false,
}) => {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const displayLabel = required ? `${label} *` : label;

  const selectedOption = options.find(option => option.value === value);
  const displayValue = selectedOption ? selectedOption.label : '';

  const hasError = !!error;
  const showHelperText = helperText || hasError;

  const handleSelect = (optionValue: string | number) => {
    onValueChange(optionValue);
    setModalVisible(false);
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableRipple
          onPress={() => !disabled && setModalVisible(true)}
          disabled={disabled}
          style={styles.touchable}
        >
          <TextInput
            label={displayLabel}
            value={displayValue}
            placeholder={placeholder}
            error={hasError}
            disabled={disabled}
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
            right={
              <TextInput.Icon
                icon="chevron-down"
                onPress={() => !disabled && setModalVisible(true)}
                disabled={disabled}
              />
            }
            editable={false}
            pointerEvents="none"
            accessible={true}
            accessibilityLabel={displayLabel}
            accessibilityHint={`Selected: ${displayValue || placeholder}`}
            accessibilityRole="button"
          />
        </TouchableRipple>

        {showHelperText && (
          <HelperText
            type={hasError ? 'error' : 'info'}
            visible={true}
            style={styles.helperText}
          >
            {error || helperText}
          </HelperText>
        )}
      </View>

      <Modal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text
                variant="titleLarge"
                style={[styles.modalTitle, { color: theme.colors.onSurface }]}
              >
                {label}
              </Text>
              <TouchableRipple
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
                borderless={true}
              >
                <TextInput.Icon icon="close" />
              </TouchableRipple>
            </View>

            <ScrollView style={styles.optionsList}>
              {options.map((option) => (
                <TouchableRipple
                  key={option.value}
                  onPress={() => handleSelect(option.value)}
                  style={styles.optionItem}
                >
                  <View style={styles.optionContent}>
                    <Text
                      variant="bodyLarge"
                      style={[
                        styles.optionText,
                        { color: theme.colors.onSurface },
                        option.value === value && { color: theme.colors.primary },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {option.value === value && (
                      <TextInput.Icon
                        icon="check"
                        color={theme.colors.primary}
                      />
                    )}
                  </View>
                </TouchableRipple>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  touchable: {
    borderRadius: 4,
  },
  input: {
    backgroundColor: 'transparent',
  },
  helperText: {
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontWeight: '600',
  },
  closeButton: {
    borderRadius: 20,
  },
  optionsList: {
    paddingHorizontal: 16,
  },
  optionItem: {
    borderRadius: 8,
    marginVertical: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  optionText: {},
});
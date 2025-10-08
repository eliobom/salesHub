import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Text, HelperText, useTheme, Button } from 'react-native-paper';
import { Modal } from 'react-native';

interface DatePickerProps {
  label: string;
  value?: Date;
  onDateChange: (date: Date) => void;
  error?: string;
  helperText?: string;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
  required?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onDateChange,
  error,
  helperText,
  placeholder = 'Select date',
  minimumDate,
  maximumDate,
  disabled = false,
  required = false,
}) => {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [tempDate, setTempDate] = useState(value || new Date());

  const displayLabel = required ? `${label} *` : label;

  const formatDate = (date: Date | undefined): string => {
    if (!date) return '';
    return date.toLocaleDateString();
  };

  const hasError = !!error;
  const showHelperText = helperText || hasError;

  const handleConfirm = () => {
    onDateChange(tempDate);
    setModalVisible(false);
  };

  const handleCancel = () => {
    setTempDate(value || new Date());
    setModalVisible(false);
  };

  const adjustDate = (days: number) => {
    const newDate = new Date(tempDate);
    newDate.setDate(newDate.getDate() + days);

    // Check constraints
    if (minimumDate && newDate < minimumDate) return;
    if (maximumDate && newDate > maximumDate) return;

    setTempDate(newDate);
  };

  const setToToday = () => {
    const today = new Date();
    if (minimumDate && today < minimumDate) return;
    if (maximumDate && today > maximumDate) return;
    setTempDate(today);
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => !disabled && setModalVisible(true)}
          disabled={disabled}
          style={styles.touchable}
        >
          <TextInput
            label={displayLabel}
            value={formatDate(value)}
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
                icon="calendar"
                onPress={() => !disabled && setModalVisible(true)}
                disabled={disabled}
              />
            }
            editable={false}
            pointerEvents="none"
            accessible={true}
            accessibilityLabel={displayLabel}
            accessibilityHint={`Selected date: ${formatDate(value) || placeholder}`}
            accessibilityRole="button"
          />
        </TouchableOpacity>

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
        onRequestClose={handleCancel}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text
              variant="titleLarge"
              style={[styles.modalTitle, { color: theme.colors.onSurface }]}
            >
              Select Date
            </Text>

            <View style={styles.dateDisplay}>
              <Text
                variant="displayMedium"
                style={[styles.selectedDate, { color: theme.colors.primary }]}
              >
                {tempDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>

            <View style={styles.controls}>
              <View style={styles.adjustButtons}>
                <Button
                  mode="outlined"
                  onPress={() => adjustDate(-1)}
                  style={styles.adjustButton}
                >
                  Previous Day
                </Button>
                <Button
                  mode="contained"
                  onPress={setToToday}
                  style={styles.todayButton}
                >
                  Today
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => adjustDate(1)}
                  style={styles.adjustButton}
                >
                  Next Day
                </Button>
              </View>
            </View>

            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={handleCancel}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleConfirm}
                style={styles.confirmButton}
              >
                Confirm
              </Button>
            </View>
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
    padding: 24,
  },
  modalTitle: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  dateDisplay: {
    alignItems: 'center',
    marginBottom: 32,
  },
  selectedDate: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  controls: {
    marginBottom: 32,
  },
  adjustButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  adjustButton: {
    flex: 1,
  },
  todayButton: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});
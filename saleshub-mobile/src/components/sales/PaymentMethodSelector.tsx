import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, RadioButton, useTheme, Card } from 'react-native-paper';

interface PaymentMethod {
  id: string;
  name: string;
  icon?: string;
  description?: string;
}

interface PaymentMethodSelectorProps {
  paymentMethods: PaymentMethod[];
  selectedMethod?: string;
  onMethodSelect: (methodId: string) => void;
  disabled?: boolean;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethods,
  selectedMethod,
  onMethodSelect,
  disabled = false,
}) => {
  const theme = useTheme();

  const handleMethodPress = (methodId: string) => {
    if (!disabled) {
      onMethodSelect(methodId);
    }
  };

  return (
    <View style={styles.container}>
      <Text
        variant="titleMedium"
        style={[styles.title, { color: theme.colors.onSurface }]}
      >
        Payment Method
      </Text>

      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          onPress={() => handleMethodPress(method.id)}
          disabled={disabled}
          style={styles.methodTouchable}
          accessible={true}
          accessibilityRole="radio"
          accessibilityState={{
            checked: selectedMethod === method.id,
            disabled,
          }}
          accessibilityLabel={`${method.name}${method.description ? `, ${method.description}` : ''}`}
        >
          <Card
            style={[
              styles.methodCard,
              selectedMethod === method.id && {
                borderColor: theme.colors.primary,
                borderWidth: 2,
              },
              disabled && { opacity: 0.5 },
            ]}
          >
            <Card.Content style={styles.methodContent}>
              <View style={styles.methodInfo}>
                <Text
                  variant="bodyLarge"
                  style={[
                    styles.methodName,
                    { color: theme.colors.onSurface },
                    selectedMethod === method.id && { color: theme.colors.primary },
                  ]}
                >
                  {method.name}
                </Text>
                {method.description && (
                  <Text
                    variant="bodySmall"
                    style={[styles.methodDescription, { color: theme.colors.onSurfaceVariant }]}
                  >
                    {method.description}
                  </Text>
                )}
              </View>
              <RadioButton
                value={method.id}
                status={selectedMethod === method.id ? 'checked' : 'unchecked'}
                onPress={() => handleMethodPress(method.id)}
                disabled={disabled}
                color={theme.colors.primary}
              />
            </Card.Content>
          </Card>
        </TouchableOpacity>
      ))}
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
  methodTouchable: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  methodCard: {
    borderRadius: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  methodInfo: {
    flex: 1,
    marginRight: 16,
  },
  methodName: {
    fontWeight: '500',
    marginBottom: 2,
  },
  methodDescription: {
    lineHeight: 16,
  },
});
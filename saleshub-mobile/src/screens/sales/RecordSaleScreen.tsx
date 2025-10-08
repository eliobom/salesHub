import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, ProgressBar, useTheme, Portal, Modal } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSalesStore } from '../../stores/salesStore';
import { useProductsStore } from '../../stores/productsStore';
import { useAuth } from '../../hooks/useAuth';
import { useOffline } from '../../hooks/useOffline';
import { ProductSearch } from '../../components/products/ProductSearch';
import { ProductCard } from '../../components/products/ProductCard';
import { SaleSummary } from '../../components/sales/SaleSummary';
import { PaymentMethodSelector } from '../../components/sales/PaymentMethodSelector';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { OfflineIndicator } from '../../components/common/OfflineIndicator';
import type { ProductWithCategory } from '../../services/products';

interface CartItem {
  product: ProductWithCategory;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  description?: string;
}

const STEPS = [
  { id: 'products', title: 'Select Products', icon: 'package-variant' },
  { id: 'cart', title: 'Review Cart', icon: 'cart' },
  { id: 'payment', title: 'Payment', icon: 'credit-card' },
  { id: 'confirmation', title: 'Confirmation', icon: 'check-circle' },
];

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'cash', name: 'Cash', description: 'Pay with cash' },
  { id: 'card', name: 'Credit/Debit Card', description: 'Pay with card' },
  { id: 'transfer', name: 'Bank Transfer', description: 'Pay via bank transfer' },
];

export default function RecordSaleScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const { user } = useAuth();
  const { isOnline } = useOffline();

  const { createSale, isCreating } = useSalesStore();
  const { products, fetchProducts, searchProducts } = useProductsStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSale, setCompletedSale] = useState<any>(null);

  // Load products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addToCart = (product: ProductWithCategory, quantity: number = 1) => {
    const existingItem = cart.find(item => item.product.id === product.id);

    if (existingItem) {
      updateCartItem(product.id, existingItem.quantity + quantity);
    } else {
      const newItem: CartItem = {
        product,
        quantity,
        unit_price: product.price,
        subtotal: product.price * quantity,
      };
      setCart([...cart, newItem]);
    }
  };

  const updateCartItem = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(item =>
      item.product.id === productId
        ? {
            ...item,
            quantity,
            subtotal: item.unit_price * quantity,
          }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchProducts(query);
    } else {
      fetchProducts();
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0: // Products
        return cart.length > 0;
      case 1: // Cart
        return cart.length > 0;
      case 2: // Payment
        return selectedPaymentMethod !== '';
      case 3: // Confirmation
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitSale = async () => {
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      setIsSubmitting(true);

      const saleData = {
        seller_id: user.id,
        total_amount: getTotalAmount(),
        status: 'completed',
        payment_method: selectedPaymentMethod,
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      };

      const newSale = await createSale(saleData);
      setCompletedSale(newSale);
      setCurrentStep(3); // Move to confirmation step
    } catch (error) {
      Alert.alert('Error', 'Failed to create sale. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartNewSale = () => {
    setCart([]);
    setSelectedPaymentMethod('');
    setCurrentStep(0);
    setCompletedSale(null);
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {STEPS.map((step, index) => (
        <View key={step.id} style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              index <= currentStep && styles.stepCircleActive,
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                index <= currentStep && styles.stepNumberActive,
              ]}
            >
              {index + 1}
            </Text>
          </View>
          <Text
            style={[
              styles.stepTitle,
              index <= currentStep && styles.stepTitleActive,
            ]}
          >
            {step.title}
          </Text>
          {index < STEPS.length - 1 && (
            <View
              style={[
                styles.stepLine,
                index < currentStep && styles.stepLineActive,
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderProductSelection = () => (
    <View style={styles.stepContent}>
      <ProductSearch
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder="Search products to add to cart..."
      />

      <ScrollView style={styles.productsList}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onPress={() => addToCart(product)}
          />
        ))}
      </ScrollView>

      {cart.length > 0 && (
        <View style={styles.cartPreview}>
          <Text style={[styles.cartPreviewTitle, { color: theme.colors.primary }]}>
            Cart ({cart.length} items)
          </Text>
          <Text style={[styles.cartPreviewTotal, { color: theme.colors.onSurface }]}>
            Total: ${getTotalAmount().toFixed(2)}
          </Text>
        </View>
      )}
    </View>
  );

  const renderCartReview = () => (
    <ScrollView style={styles.stepContent}>
      {cart.map((item) => (
        <View key={item.product.id} style={styles.cartItem}>
          <View style={styles.cartItemInfo}>
            <Text style={[styles.cartItemName, { color: theme.colors.onSurface }]}>
              {item.product.name}
            </Text>
            <Text style={[styles.cartItemPrice, { color: theme.colors.onSurfaceVariant }]}>
              ${item.unit_price.toFixed(2)} each
            </Text>
          </View>
          <View style={styles.cartItemControls}>
            <Button
              mode="outlined"
              onPress={() => updateCartItem(item.product.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              compact
            >
              -
            </Button>
            <Text style={[styles.cartItemQuantity, { color: theme.colors.onSurface }]}>
              {item.quantity}
            </Text>
            <Button
              mode="outlined"
              onPress={() => updateCartItem(item.product.id, item.quantity + 1)}
              compact
            >
              +
            </Button>
            <Button
              mode="text"
              onPress={() => removeFromCart(item.product.id)}
              textColor={theme.colors.error}
              compact
            >
              Remove
            </Button>
          </View>
        </View>
      ))}

      <SaleSummary
        items={cart.map(item => ({
          id: item.product.id,
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
          products: {
            id: item.product.id,
            name: item.product.name,
            price: item.unit_price,
          },
        }))}
      />
    </ScrollView>
  );

  const renderPaymentSelection = () => (
    <View style={styles.stepContent}>
      <PaymentMethodSelector
        paymentMethods={PAYMENT_METHODS}
        selectedMethod={selectedPaymentMethod}
        onMethodSelect={setSelectedPaymentMethod}
      />

      <SaleSummary
        items={cart.map(item => ({
          id: item.product.id,
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
          products: {
            id: item.product.id,
            name: item.product.name,
            price: item.unit_price,
          },
        }))}
      />

      <View style={styles.paymentActions}>
        <Button
          mode="contained"
          onPress={handleSubmitSale}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.submitButton}
        >
          {isSubmitting ? 'Processing...' : isOnline ? 'Complete Sale' : 'Queue Sale'}
        </Button>
        {!isOnline && (
          <Text style={[styles.offlineWarning, { color: theme.colors.tertiary }]}>
            Sale will be queued and synced when online
          </Text>
        )}
      </View>
    </View>
  );

  const renderConfirmation = () => (
    <View style={styles.stepContent}>
      {completedSale ? (
        <View style={styles.confirmationContent}>
          <Text style={[styles.confirmationTitle, { color: theme.colors.primary }]}>
            Sale Completed Successfully!
          </Text>

          <View style={styles.confirmationDetails}>
            <Text style={[styles.confirmationLabel, { color: theme.colors.onSurfaceVariant }]}>
              Sale ID:
            </Text>
            <Text style={[styles.confirmationValue, { color: theme.colors.onSurface }]}>
              {completedSale.id}
            </Text>

            <Text style={[styles.confirmationLabel, { color: theme.colors.onSurfaceVariant }]}>
              Total Amount:
            </Text>
            <Text style={[styles.confirmationValue, { color: theme.colors.primary }]}>
              ${completedSale.total_amount.toFixed(2)}
            </Text>

            <Text style={[styles.confirmationLabel, { color: theme.colors.onSurfaceVariant }]}>
              Payment Method:
            </Text>
            <Text style={[styles.confirmationValue, { color: theme.colors.onSurface }]}>
              {PAYMENT_METHODS.find(m => m.id === completedSale.payment_method)?.name}
            </Text>
          </View>

          <Button
            mode="contained"
            onPress={handleStartNewSale}
            style={styles.newSaleButton}
          >
            Start New Sale
          </Button>

          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            Back to Home
          </Button>
        </View>
      ) : (
        <LoadingSpinner />
      )}
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderProductSelection();
      case 1:
        return renderCartReview();
      case 2:
        return renderPaymentSelection();
      case 3:
        return renderConfirmation();
      default:
        return null;
    }
  };

  return (
    <ScreenContainer>
      <OfflineIndicator />

      {renderStepIndicator()}

      <ProgressBar
        progress={(currentStep + 1) / STEPS.length}
        style={styles.progressBar}
      />

      {renderCurrentStep()}

      {currentStep < 3 && (
        <View style={styles.navigationButtons}>
          <Button
            mode="outlined"
            onPress={handlePrevious}
            disabled={currentStep === 0}
            style={styles.navButton}
          >
            Previous
          </Button>
          <Button
            mode="contained"
            onPress={handleNext}
            disabled={!canProceedToNext()}
            style={styles.navButton}
          >
            {currentStep === STEPS.length - 2 ? 'Review & Pay' : 'Next'}
          </Button>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: '#6200ee',
  },
  stepNumber: {
    color: '#666',
    fontWeight: 'bold',
  },
  stepNumberActive: {
    color: 'white',
  },
  stepTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  stepTitleActive: {
    color: '#6200ee',
    fontWeight: '500',
  },
  stepLine: {
    position: 'absolute',
    top: 20,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: '#e0e0e0',
  },
  stepLineActive: {
    backgroundColor: '#6200ee',
  },
  progressBar: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  productsList: {
    flex: 1,
    marginTop: 16,
  },
  cartPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginTop: 16,
  },
  cartPreviewTitle: {
    fontWeight: '500',
  },
  cartPreviewTotal: {
    fontWeight: 'bold',
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginVertical: 4,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontWeight: '500',
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 14,
  },
  cartItemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartItemQuantity: {
    minWidth: 30,
    textAlign: 'center',
    fontWeight: '500',
  },
  paymentActions: {
    marginTop: 24,
  },
  submitButton: {
    marginBottom: 8,
  },
  offlineWarning: {
    textAlign: 'center',
    fontSize: 14,
  },
  confirmationContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  confirmationDetails: {
    width: '100%',
    marginBottom: 32,
  },
  confirmationLabel: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 4,
  },
  confirmationValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  newSaleButton: {
    width: '100%',
    marginBottom: 12,
  },
  backButton: {
    width: '100%',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 16,
  },
  navButton: {
    flex: 1,
  },
});
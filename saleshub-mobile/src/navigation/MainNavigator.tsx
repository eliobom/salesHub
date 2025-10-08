import React, { lazy } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ProductsListScreen from '../screens/products/ProductsListScreen';
import SearchScreen from '../screens/products/SearchScreen';
import RecordSaleScreen from '../screens/sales/RecordSaleScreen';
import SalesHistoryScreen from '../screens/sales/SalesHistoryScreen';

const ProductDetailScreen = lazy(() => import('../screens/products/ProductDetailScreen'));
const SaleDetailScreen = lazy(() => import('../screens/sales/SaleDetailScreen'));

export type MainStackParamList = {
  Home: undefined;
  ProductsList: undefined;
  ProductDetail: { productId?: string } | undefined;
  Search: undefined;
  RecordSale: undefined;
  SalesHistory: undefined;
  SaleDetail: { saleId: string };
  // Profile: undefined;
};

const Stack = createStackNavigator<MainStackParamList>();

export default function MainNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: true, // Show headers for main app screens
        gestureEnabled: true, // Allow swipe back gestures
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'SalesHub',
          headerLeft: () => null, // Prevent going back to auth screens
        }}
      />
      <Stack.Screen
        name="ProductsList"
        component={ProductsListScreen}
        options={{
          title: 'Products',
        }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{
          title: 'Product Details',
        }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'Search Products',
          headerShown: false, // Custom header in screen
        }}
      />
      <Stack.Screen
        name="RecordSale"
        component={RecordSaleScreen}
        options={{
          title: 'Record Sale',
          headerLeft: () => null, // Prevent going back during sale recording
        }}
      />
      <Stack.Screen
        name="SalesHistory"
        component={SalesHistoryScreen}
        options={{
          title: 'Sales History',
        }}
      />
      <Stack.Screen
        name="SaleDetail"
        component={SaleDetailScreen}
        options={{
          title: 'Sale Details',
        }}
      />
    </Stack.Navigator>
  );
}
// App Constants

// API and Network
export const API_TIMEOUT = 30000; // 30 seconds
export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY = 1000; // 1 second

// Cache
export const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes
export const OFFLINE_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Validation
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_NAME_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_EMAIL_LENGTH = 254;

// Product
export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Sports',
  'Books',
  'Toys',
  'Beauty',
  'Automotive',
  'Other',
] as const;

export const PRODUCT_STATUSES = [
  'active',
  'inactive',
  'discontinued',
] as const;

// Sales
export const SALE_STATUSES = [
  'pending',
  'completed',
  'cancelled',
  'refunded',
] as const;

export const PAYMENT_METHODS = [
  'cash',
  'card',
  'bank_transfer',
  'digital_wallet',
  'other',
] as const;

// Seller
export const COMMISSION_RATE_MIN = 0;
export const COMMISSION_RATE_MAX = 50; // 50%

// UI
export const TOAST_DURATION = 3000; // 3 seconds
export const DEBOUNCE_DELAY = 300; // 300ms
export const ANIMATION_DURATION = 300; // 300ms

// Colors (for consistency)
export const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#5AC8FA',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  text: '#1C1C1E',
  textSecondary: '#8E8E93',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_DATA: '@user_data',
  APP_SETTINGS: '@app_settings',
  OFFLINE_QUEUE: '@offline_queue',
  CACHE_PRODUCTS: '@products_cache',
  CACHE_SALES: '@sales_cache',
  CACHE_SELLERS: '@sellers_cache',
  SYNC_STATUS: '@sync_status',
} as const;

// Routes
export const ROUTES = {
  HOME: 'Home',
  PRODUCTS: 'Products',
  SALES: 'Sales',
  SELLERS: 'Sellers',
  PROFILE: 'Profile',
  SETTINGS: 'Settings',
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  OFFLINE: 'You are currently offline. Changes will be synced when online.',
  SYNC_FAILED: 'Failed to sync data. Please try again.',
  LOGIN_FAILED: 'Invalid email or password.',
  REGISTRATION_FAILED: 'Failed to create account. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  REGISTRATION_SUCCESS: 'Account created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  DATA_SYNCED: 'Data synced successfully.',
  SALE_CREATED: 'Sale created successfully.',
  PRODUCT_CREATED: 'Product created successfully.',
  SELLER_CREATED: 'Seller created successfully.',
} as const;

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_SHORT: 'MM/DD/YYYY',
  API: 'YYYY-MM-DDTHH:mm:ssZ',
  TIME: 'HH:mm',
  DATETIME: 'MMM DD, YYYY HH:mm',
} as const;

// Currency
export const CURRENCY = {
  CODE: 'USD',
  SYMBOL: '$',
  LOCALE: 'en-US',
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILES: 5,
} as const;

// Search
export const SEARCH = {
  MIN_QUERY_LENGTH: 2,
  DEBOUNCE_DELAY: 300,
  MAX_RESULTS: 50,
} as const;

// Sync
export const SYNC = {
  INTERVAL: 5 * 60 * 1000, // 5 minutes
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 2000, // 2 seconds
} as const;
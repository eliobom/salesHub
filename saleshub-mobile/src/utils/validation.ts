import {
  MIN_PASSWORD_LENGTH,
  MAX_NAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_EMAIL_LENGTH,
  COMMISSION_RATE_MIN,
  COMMISSION_RATE_MAX,
  REGEX_PATTERNS,
  FILE_UPLOAD
} from './constants';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationRule<T = any> {
  test: (value: T) => boolean;
  message: string;
}

// Generic validation functions
export const validateRequired = (value: any, fieldName: string): ValidationResult => {
  const isValid = value != null && value !== '' && (!Array.isArray(value) || value.length > 0);
  return {
    isValid,
    errors: isValid ? [] : [`${fieldName} is required`],
  };
};

export const validateMinLength = (value: string, minLength: number, fieldName: string): ValidationResult => {
  const isValid = value.length >= minLength;
  return {
    isValid,
    errors: isValid ? [] : [`${fieldName} must be at least ${minLength} characters long`],
  };
};

export const validateMaxLength = (value: string, maxLength: number, fieldName: string): ValidationResult => {
  const isValid = value.length <= maxLength;
  return {
    isValid,
    errors: isValid ? [] : [`${fieldName} must be no more than ${maxLength} characters long`],
  };
};

export const validateRange = (value: number, min: number, max: number, fieldName: string): ValidationResult => {
  const isValid = value >= min && value <= max;
  return {
    isValid,
    errors: isValid ? [] : [`${fieldName} must be between ${min} and ${max}`],
  };
};

export const validatePattern = (value: string, pattern: RegExp, fieldName: string, message?: string): ValidationResult => {
  const isValid = pattern.test(value);
  return {
    isValid,
    errors: isValid ? [] : [message || `${fieldName} format is invalid`],
  };
};

export const validateEmail = (email: string): ValidationResult => {
  return validatePattern(email, REGEX_PATTERNS.EMAIL, 'Email', 'Please enter a valid email address');
};

export const validatePhone = (phone: string): ValidationResult => {
  return validatePattern(phone, REGEX_PATTERNS.PHONE, 'Phone', 'Please enter a valid phone number');
};

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];

  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
  }

  if (!REGEX_PATTERNS.PASSWORD.test(password)) {
    errors.push('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateUrl = (url: string): ValidationResult => {
  return validatePattern(url, REGEX_PATTERNS.URL, 'URL', 'Please enter a valid URL');
};

// Business logic validations
export const validateProduct = (product: {
  name?: string;
  price?: number;
  stock?: number;
  description?: string;
}): ValidationResult => {
  const errors: string[] = [];

  // Name validation
  if (!product.name?.trim()) {
    errors.push('Product name is required');
  } else if (product.name.length > MAX_NAME_LENGTH) {
    errors.push(`Product name must be no more than ${MAX_NAME_LENGTH} characters`);
  }

  // Price validation
  if (product.price == null || product.price < 0) {
    errors.push('Price must be a positive number');
  }

  // Stock validation
  if (product.stock != null && product.stock < 0) {
    errors.push('Stock cannot be negative');
  }

  // Description validation
  if (product.description && product.description.length > MAX_DESCRIPTION_LENGTH) {
    errors.push(`Description must be no more than ${MAX_DESCRIPTION_LENGTH} characters`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateSeller = (seller: {
  email?: string;
  full_name?: string;
  phone?: string;
  commission_rate?: number;
}): ValidationResult => {
  const errors: string[] = [];

  // Email validation
  if (!seller.email?.trim()) {
    errors.push('Email is required');
  } else {
    const emailValidation = validateEmail(seller.email);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.errors);
    }
  }

  // Full name validation
  if (!seller.full_name?.trim()) {
    errors.push('Full name is required');
  } else if (seller.full_name.length > MAX_NAME_LENGTH) {
    errors.push(`Full name must be no more than ${MAX_NAME_LENGTH} characters`);
  }

  // Phone validation (optional)
  if (seller.phone?.trim()) {
    const phoneValidation = validatePhone(seller.phone);
    if (!phoneValidation.isValid) {
      errors.push(...phoneValidation.errors);
    }
  }

  // Commission rate validation
  if (seller.commission_rate != null) {
    const commissionValidation = validateRange(
      seller.commission_rate,
      COMMISSION_RATE_MIN,
      COMMISSION_RATE_MAX,
      'Commission rate'
    );
    if (!commissionValidation.isValid) {
      errors.push(...commissionValidation.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateSale = (sale: {
  total_amount?: number;
  status?: string;
  payment_method?: string;
  items?: Array<{
    product_id?: string;
    quantity?: number;
    unit_price?: number;
  }>;
}): ValidationResult => {
  const errors: string[] = [];

  // Total amount validation
  if (sale.total_amount == null || sale.total_amount < 0) {
    errors.push('Total amount must be a positive number');
  }

  // Status validation
  if (sale.status && !['pending', 'completed', 'cancelled', 'refunded'].includes(sale.status)) {
    errors.push('Invalid sale status');
  }

  // Payment method validation
  if (sale.payment_method && !['cash', 'card', 'bank_transfer', 'digital_wallet', 'other'].includes(sale.payment_method)) {
    errors.push('Invalid payment method');
  }

  // Items validation
  if (!sale.items || sale.items.length === 0) {
    errors.push('Sale must have at least one item');
  } else {
    sale.items.forEach((item, index) => {
      if (!item.product_id) {
        errors.push(`Item ${index + 1}: Product is required`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
      }
      if (item.unit_price == null || item.unit_price < 0) {
        errors.push(`Item ${index + 1}: Unit price must be a positive number`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateUser = (user: {
  email?: string;
  password?: string;
  full_name?: string;
}): ValidationResult => {
  const errors: string[] = [];

  // Email validation
  if (!user.email?.trim()) {
    errors.push('Email is required');
  } else {
    const emailValidation = validateEmail(user.email);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.errors);
    }
  }

  // Password validation (only if provided)
  if (user.password) {
    const passwordValidation = validatePassword(user.password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
  }

  // Full name validation
  if (user.full_name && user.full_name.length > MAX_NAME_LENGTH) {
    errors.push(`Full name must be no more than ${MAX_NAME_LENGTH} characters`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateFile = (file: {
  size: number;
  type: string;
  name: string;
}): ValidationResult => {
  const errors: string[] = [];

  // Size validation
  if (file.size > FILE_UPLOAD.MAX_SIZE) {
    errors.push(`File size must be no more than ${FILE_UPLOAD.MAX_SIZE / (1024 * 1024)}MB`);
  }

  // Type validation
  if (!FILE_UPLOAD.ALLOWED_TYPES.includes(file.type as any)) {
    errors.push(`File type ${file.type} is not allowed. Allowed types: ${FILE_UPLOAD.ALLOWED_TYPES.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Combined validation function
export const validateForm = <T>(
  data: T,
  rules: Array<{
    field: keyof T;
    rules: ValidationRule[];
  }>
): ValidationResult => {
  const errors: string[] = [];

  rules.forEach(({ field, rules: fieldRules }) => {
    const value = data[field];

    fieldRules.forEach(rule => {
      if (!rule.test(value)) {
        errors.push(rule.message);
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Utility functions
export const combineValidations = (...validations: ValidationResult[]): ValidationResult => {
  const allErrors = validations.flatMap(v => v.errors);
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};

export const hasValidationErrors = (result: ValidationResult): boolean => {
  return !result.isValid;
};

export const getFirstError = (result: ValidationResult): string | null => {
  return result.errors.length > 0 ? result.errors[0] : null;
};
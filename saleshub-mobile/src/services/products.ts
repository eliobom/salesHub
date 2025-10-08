import { ApiService } from './api';
import type { Database } from '../lib/supabase';

type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

export interface ProductWithCategory extends Product {
  categories?: {
    id: string;
    name: string;
    description: string | null;
  } | null;
}

export class ProductService {
  // Get all products with optional category information
  static async getAll(options?: {
    includeCategory?: boolean;
    filter?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
  }): Promise<ProductWithCategory[]> {
    const select = options?.includeCategory
      ? '*, categories(id, name, description)'
      : '*';

    return await ApiService.getAll('products', {
      ...options,
      select,
    }) as ProductWithCategory[];
  }

  // Get product by ID
  static async getById(id: string, includeCategory = false): Promise<ProductWithCategory | null> {
    const select = includeCategory
      ? '*, categories(id, name, description)'
      : '*';

    return await ApiService.getById('products', id, select) as ProductWithCategory | null;
  }

  // Create new product
  static async create(product: ProductInsert): Promise<Product> {
    return await ApiService.create('products', product);
  }

  // Update product
  static async update(id: string, updates: ProductUpdate): Promise<Product> {
    return await ApiService.update('products', id, updates);
  }

  // Delete product
  static async delete(id: string): Promise<void> {
    return await ApiService.delete('products', id);
  }

  // Get products by category
  static async getByCategory(categoryId: string): Promise<Product[]> {
    return await ApiService.getAll('products', {
      filter: { category_id: categoryId },
    });
  }

  // Search products
  static async search(query: string, options?: {
    categoryId?: string;
    limit?: number;
  }): Promise<Product[]> {
    let filter: Record<string, any> = {};

    if (options?.categoryId) {
      filter.category_id = options.categoryId;
    }

    // Note: This is a basic search. For more advanced search,
    // you might want to use Supabase's text search or full-text search
    const products = await ApiService.getAll('products', {
      filter,
      limit: options?.limit,
    });

    // Client-side filtering for name and description
    return products.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(query.toLowerCase()))
    );
  }

  // Get active products
  static async getActive(): Promise<Product[]> {
    return await ApiService.getAll('products', {
      filter: { is_active: true },
    });
  }

  // Get low stock products
  static async getLowStock(threshold = 10): Promise<Product[]> {
    const products = await ApiService.getAll('products', {
      filter: { is_active: true },
    });

    return products.filter(product => product.stock <= threshold);
  }

  // Update product stock
  static async updateStock(id: string, newStock: number): Promise<Product> {
    return await ApiService.update('products', id, { stock: newStock });
  }

  // Bulk update products
  static async bulkUpdate(updates: Array<{ id: string; data: ProductUpdate }>): Promise<Product[]> {
    return await ApiService.updateMany('products', updates);
  }

  // Get products with pagination
  static async getPaginated(page = 1, pageSize = 20, options?: {
    categoryId?: string;
    search?: string;
    includeCategory?: boolean;
  }): Promise<{
    data: ProductWithCategory[];
    count: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    let filter: Record<string, any> = {};

    if (options?.categoryId) {
      filter.category_id = options.categoryId;
    }

    const select = options?.includeCategory
      ? '*, categories(id, name, description)'
      : '*';

    const data = await ApiService.getAll('products', {
      select,
      filter,
      limit: pageSize,
      // Note: For proper pagination, you'd need to implement server-side pagination
    });

    // Client-side search if needed
    let filteredData = data;
    if (options?.search) {
      filteredData = data.filter((product: Product) =>
        product.name.toLowerCase().includes(options.search!.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(options.search!.toLowerCase()))
      );
    }

    return {
      data: filteredData as ProductWithCategory[],
      count: filteredData.length,
      page,
      pageSize,
      totalPages: Math.ceil(filteredData.length / pageSize),
    };
  }
}
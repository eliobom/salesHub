import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config/supabaseConfig';

export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          password_hash: string;
          full_name: string | null;
          phone: string | null;
          is_active: boolean;
          avatar_url: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          username: string;
          password_hash: string;
          full_name?: string | null;
          phone?: string | null;
          is_active?: boolean;
          avatar_url?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          password_hash?: string;
          full_name?: string | null;
          phone?: string | null;
          is_active?: boolean;
          avatar_url?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      sellers: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          is_active: boolean;
          avatar_url: string | null;
          commission_rate: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          phone?: string | null;
          is_active?: boolean;
          avatar_url?: string | null;
          commission_rate?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone?: string | null;
          is_active?: boolean;
          avatar_url?: string | null;
          commission_rate?: number;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          stock: number;
          category_id: string | null;
          images: string[];
          sku: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          stock?: number;
          category_id?: string | null;
          images?: string[];
          sku?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          stock?: number;
          category_id?: string | null;
          images?: string[];
          sku?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      sales: {
        Row: {
          id: string;
          seller_id: string | null;
          total_amount: number;
          status: string;
          payment_method: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          seller_id?: string | null;
          total_amount: number;
          status?: string;
          payment_method?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string | null;
          total_amount?: number;
          status?: string;
          payment_method?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string | null;
          product_id: string | null;
          quantity: number;
          unit_price: number;
          subtotal: number;
        };
        Insert: {
          id?: string;
          sale_id?: string | null;
          product_id?: string | null;
          quantity: number;
          unit_price: number;
          subtotal: number;
        };
        Update: {
          id?: string;
          sale_id?: string | null;
          product_id?: string | null;
          quantity?: number;
          unit_price?: number;
          subtotal?: number;
        };
      };
    };
  };
};

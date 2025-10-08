/*
  # Sales Management System Schema

  ## Overview
  Complete database schema for a sales management dashboard with products, sellers, sales tracking, and categories.

  ## New Tables

  ### 1. categories
  - `id` (uuid, primary key) - Unique category identifier
  - `name` (text, not null) - Category name
  - `description` (text) - Category description
  - `created_at` (timestamptz) - Creation timestamp

  ### 2. sellers
  - `id` (uuid, primary key) - Unique seller identifier
  - `email` (text, unique, not null) - Seller email address
  - `full_name` (text, not null) - Seller full name
  - `phone` (text) - Phone number
  - `is_active` (boolean) - Account status
  - `avatar_url` (text) - Profile picture URL
  - `commission_rate` (numeric) - Commission percentage
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. products
  - `id` (uuid, primary key) - Unique product identifier
  - `name` (text, not null) - Product name
  - `description` (text) - Product description
  - `price` (numeric, not null) - Product price
  - `stock` (integer) - Available stock quantity
  - `category_id` (uuid, foreign key) - Reference to categories
  - `images` (jsonb) - Array of image URLs
  - `sku` (text, unique) - Stock keeping unit
  - `is_active` (boolean) - Product availability status
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. sales
  - `id` (uuid, primary key) - Unique sale identifier
  - `seller_id` (uuid, foreign key) - Reference to sellers
  - `total_amount` (numeric, not null) - Total sale amount
  - `status` (text) - Sale status (pending, completed, cancelled)
  - `payment_method` (text) - Payment method used
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Sale timestamp

  ### 5. sale_items
  - `id` (uuid, primary key) - Unique item identifier
  - `sale_id` (uuid, foreign key) - Reference to sales
  - `product_id` (uuid, foreign key) - Reference to products
  - `quantity` (integer, not null) - Quantity sold
  - `unit_price` (numeric, not null) - Price per unit at time of sale
  - `subtotal` (numeric, not null) - Item subtotal

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their data
  - Restrict access based on user roles

  ## Notes
  1. All tables use UUID for primary keys with automatic generation
  2. Timestamps are automatically set using now()
  3. Images are stored as JSONB array for flexibility
  4. Sale items track historical prices to maintain accurate records
  5. Seller commission rates are stored as decimals (e.g., 0.10 for 10%)
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create sellers table
CREATE TABLE IF NOT EXISTS sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  is_active boolean DEFAULT true,
  avatar_url text,
  commission_rate numeric(5,2) DEFAULT 0.10,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  stock integer DEFAULT 0,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  images jsonb DEFAULT '[]'::jsonb,
  sku text UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES sellers(id) ON DELETE SET NULL,
  total_amount numeric(10,2) NOT NULL,
  status text DEFAULT 'pending',
  payment_method text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create sale_items table
CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES sales(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  quantity integer NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  subtotal numeric(10,2) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_sales_seller ON sales(seller_id);
CREATE INDEX IF NOT EXISTS idx_sales_created ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(product_id);

-- Additional indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_sales_seller_created ON sales(seller_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sales_created_total ON sales(created_at, total_amount);
CREATE INDEX IF NOT EXISTS idx_sales_total_amount ON sales(total_amount);
CREATE INDEX IF NOT EXISTS idx_sellers_active ON sellers(is_active);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_quantity ON sale_items(product_id, quantity);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Public can view categories"
  ON categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Sellers policies
CREATE POLICY "Authenticated users can view sellers"
  ON sellers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage sellers"
  ON sellers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Products policies
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Sales policies
CREATE POLICY "Authenticated users can view sales"
  ON sales FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create sales"
  ON sales FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sales"
  ON sales FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete sales"
  ON sales FOR DELETE
  TO authenticated
  USING (true);

-- Sale items policies
CREATE POLICY "Authenticated users can view sale items"
  ON sale_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage sale items"
  ON sale_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create view for top sellers with aggregated sales data
CREATE OR REPLACE VIEW top_sellers_view AS
SELECT
  s.id,
  s.full_name,
  s.email,
  s.phone,
  s.is_active,
  s.avatar_url,
  s.commission_rate,
  s.created_at,
  COALESCE(SUM(sl.total_amount), 0)::numeric(10,2) as total_sales_amount,
  COUNT(sl.id) as total_sales_count
FROM sellers s
LEFT JOIN sales sl ON s.id = sl.seller_id AND sl.status = 'completed'
WHERE s.is_active = true
GROUP BY s.id, s.full_name, s.email, s.phone, s.is_active, s.avatar_url, s.commission_rate, s.created_at
ORDER BY total_sales_amount DESC, total_sales_count DESC;

-- Create function for top sellers with date range
CREATE OR REPLACE FUNCTION get_top_sellers(
  limit_count integer DEFAULT 5,
  start_date timestamptz DEFAULT NULL,
  end_date timestamptz DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  phone text,
  is_active boolean,
  avatar_url text,
  commission_rate numeric,
  created_at timestamptz,
  total_sales_amount numeric,
  total_sales_count bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    s.id,
    s.full_name,
    s.email,
    s.phone,
    s.is_active,
    s.avatar_url,
    s.commission_rate,
    s.created_at,
    COALESCE(SUM(sl.total_amount), 0)::numeric(10,2) as total_sales_amount,
    COUNT(sl.id) as total_sales_count
  FROM sellers s
  LEFT JOIN sales sl ON s.id = sl.seller_id AND sl.status = 'completed'
    AND (start_date IS NULL OR sl.created_at >= start_date)
    AND (end_date IS NULL OR sl.created_at <= end_date)
  WHERE s.is_active = true
  GROUP BY s.id, s.full_name, s.email, s.phone, s.is_active, s.avatar_url, s.commission_rate, s.created_at
  ORDER BY total_sales_amount DESC, total_sales_count DESC
  LIMIT limit_count;
$$;

-- Create function for sales summary with server-side aggregation
CREATE OR REPLACE FUNCTION get_sales_summary(
  seller_id uuid DEFAULT NULL,
  start_date timestamptz DEFAULT NULL,
  end_date timestamptz DEFAULT NULL
)
RETURNS TABLE (
  total_sales bigint,
  total_revenue numeric,
  average_sale numeric,
  sales_by_status jsonb
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH filtered_sales AS (
    SELECT
      total_amount,
      status
    FROM sales
    WHERE (seller_id IS NULL OR seller_id = get_sales_summary.seller_id)
      AND (start_date IS NULL OR created_at >= start_date)
      AND (end_date IS NULL OR created_at <= end_date)
  ),
  summary_stats AS (
    SELECT
      COUNT(*) as total_sales,
      COALESCE(SUM(total_amount), 0)::numeric(10,2) as total_revenue,
      CASE
        WHEN COUNT(*) > 0 THEN COALESCE(AVG(total_amount), 0)::numeric(10,2)
        ELSE 0::numeric(10,2)
      END as average_sale
    FROM filtered_sales
  ),
  status_counts AS (
    SELECT
      status,
      COUNT(*) as count
    FROM filtered_sales
    GROUP BY status
  )
  SELECT
    s.total_sales,
    s.total_revenue,
    s.average_sale,
    COALESCE(jsonb_object_agg(sc.status, sc.count), '{}'::jsonb) as sales_by_status
  FROM summary_stats s
  CROSS JOIN (
    SELECT jsonb_object_agg(status, count) as sales_by_status
    FROM status_counts
  ) sc;
$$;

-- Insert sample data
INSERT INTO categories (name, description) VALUES
  ('Electronics', 'Electronic devices and gadgets'),
  ('Clothing', 'Apparel and fashion items'),
  ('Home & Garden', 'Home improvement and garden supplies'),
  ('Sports', 'Sports equipment and accessories'),
  ('Books', 'Books and educational materials')
ON CONFLICT DO NOTHING;

INSERT INTO sellers (email, full_name, phone, commission_rate) VALUES
  ('juan.perez@example.com', 'Juan Pérez', '+1234567890', 0.15),
  ('maria.garcia@example.com', 'María García', '+1234567891', 0.12),
  ('carlos.lopez@example.com', 'Carlos López', '+1234567892', 0.10)
ON CONFLICT DO NOTHING;
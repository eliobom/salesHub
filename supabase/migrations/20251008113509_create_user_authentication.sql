/*
  # User Authentication Schema

  ## Overview
  Database schema for user authentication with email/password login, including user profiles and metadata.

  ## New Tables

  ### 1. users
  - `id` (uuid, primary key) - Unique user identifier
  - `email` (text, unique, not null) - User email address
  - `username` (text, unique, not null) - Unique username for login
  - `password_hash` (text, not null) - Bcrypt hashed password
  - `full_name` (text) - User's full name
  - `phone` (text) - Phone number
  - `is_active` (boolean) - Account status
  - `avatar_url` (text) - Profile picture URL
  - `role` (text) - User role (admin, seller, etc.)
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on users table
  - Add policies for user registration and management
  - Passwords are hashed using bcrypt

  ## Notes
  1. Uses pgcrypto extension for password hashing
  2. UUID primary keys with automatic generation
  3. Timestamps automatically set using now()
  4. Default users inserted for testing purposes
*/

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text,
  phone text,
  is_active boolean DEFAULT true,
  avatar_url text,
  role text DEFAULT 'seller',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Allow login queries"
   ON users FOR SELECT
   TO anon
   USING (is_active = true);

CREATE POLICY "Users can view their own profile"
   ON users FOR SELECT
   TO authenticated
   USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
   ON users FOR UPDATE
   TO authenticated
   USING (auth.uid() = id)
   WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow user registration"
   ON users FOR INSERT
   TO anon, authenticated
   WITH CHECK (true);

CREATE POLICY "Admins can manage all users"
    ON users FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND role = 'admin'
      )
    );

CREATE POLICY "Allow anonymous admin operations"
    ON users FOR ALL
    TO anon
    USING (role = 'admin')
    WITH CHECK (role = 'admin');

-- Insert default users with hashed passwords
-- You can modify or add admin credentials here
INSERT INTO users (email, username, password_hash, full_name, role) VALUES
   ('admin@example.com', 'admin', '$2b$10$3BFqOZy4piVpz5Ba1c40e.gwf3dd4F9NW5xR22NkTVUdewsaEdf9e', 'System Administrator', 'admin')
ON CONFLICT (email) DO NOTHING;
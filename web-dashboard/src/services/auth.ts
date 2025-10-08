import { supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs';

export interface AuthUser {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

export class AuthService {
  // Get current session - not used in custom auth
  static async getCurrentSession(): Promise<null> {
    return null;
  }

  // Get current user - not used in custom auth
  static async getCurrentUser(): Promise<null> {
    return null;
  }

  // Sign in with username and password
  static async signIn({ username, password }: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        // Fallback to hardcoded admin login for testing
        if (username === 'admin' && password === 'admin123') {
          return {
            success: true,
            user: {
              id: 'admin-hardcoded',
              email: 'admin@example.com',
              full_name: 'Admin User',
              avatar_url: undefined,
              role: 'admin',
            }
          };
        }
        throw new Error('Invalid credentials');
      }

      const isValidPassword = bcrypt.compareSync(password, data.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      const user: AuthUser = {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        role: data.role,
      };

      return { success: true, user };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign in failed'
      };
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    // No-op for custom auth
  }

  // Listen to auth state changes - not used in custom auth
  static onAuthStateChange(
    callback: (event: string, session: null) => void
  ) {
    // Return a dummy subscription
    return {
      data: { subscription: { unsubscribe: () => {} } }
    };
  }

  // Legacy methods for backward compatibility
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.signIn(credentials);
  }

  static async logout(): Promise<void> {
    return this.signOut();
  }

  static isAuthenticated(): boolean {
    // This will be handled by the context
    return false;
  }
}
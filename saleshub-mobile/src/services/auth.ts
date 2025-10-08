import { supabase } from '../lib/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  full_name?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export class AuthService {
  // Get current session
  static async getCurrentSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  }

  // Sign up with email and password
  static async signUp({
    email,
    password,
    full_name,
  }: SignUpData): Promise<{ user: User | null; session: Session | null }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
        },
      },
    });

    if (error) throw error;
    return data;
  }

  // Sign in with email and password
  static async signIn({ email, password }: SignInData): Promise<{ user: User; session: Session }> {
    // Hardcoded admin login for testing (bypasses database)
    if (email === 'admin' && password === 'admin123') {
      const mockUser: User = {
        id: 'admin-user-id',
        email: 'admin',
        user_metadata: {
          full_name: 'Admin User',
          role: 'admin',
        },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: 'authenticated',
        confirmation_sent_at: new Date().toISOString(),
        recovery_sent_at: new Date().toISOString(),
        email_change_sent_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
      };

      const mockSession: Session = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_at: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour from now
        expires_in: 3600, // 1 hour in seconds
        token_type: 'bearer',
        user: mockUser,
      };

      return { user: mockUser, session: mockSession };
    }

    // Primary database authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  // Sign out
  static async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  // Reset password
  static async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  // Update password
  static async updatePassword(password: string): Promise<User> {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });

    if (error) throw error;
    return data.user;
  }

  // Update user metadata
  static async updateProfile(updates: {
    full_name?: string;
    avatar_url?: string;
  }): Promise<User> {
    const { data, error } = await supabase.auth.updateUser({
      data: updates,
    });

    if (error) throw error;
    return data.user;
  }

  // Listen to auth state changes
  static onAuthStateChange(
    callback: (event: string, session: Session | null) => void
  ) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Sign in with OAuth provider
  static async signInWithProvider(provider: 'google' | 'github' | 'apple') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: undefined, // For mobile, handle redirect in app
      },
    });

    if (error) throw error;
    return data;
  }

  // Refresh session
  static async refreshSession(): Promise<Session> {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data.session!;
  }

  // Verify email
  static async verifyOtp(email: string, token: string): Promise<{ user: User | null; session: Session | null }> {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) throw error;
    return data;
  }
}
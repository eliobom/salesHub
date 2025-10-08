import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService, AuthUser } from '../services/auth';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateProfile: (updates: { full_name?: string; avatar_url?: string }) => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;

  // Error handling
  error: string | null;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
      error: null,

      // Initialize auth state
      initialize: async () => {
        try {
          set({ isLoading: true, error: null });

          const session = await AuthService.getCurrentSession();
          const user = session?.user || null;

          set({
            session,
            user,
            isAuthenticated: !!user,
            isLoading: false,
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to initialize auth',
            isLoading: false,
            isAuthenticated: false,
          });
        }
      },

      // Sign in
      signIn: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });

          const { user, session } = await AuthService.signIn({ email, password });

          set({
            user,
            session,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      // Sign up
      signUp: async (email: string, password: string, fullName?: string) => {
        try {
          set({ isLoading: true, error: null });

          const { user, session } = await AuthService.signUp({
            email,
            password,
            full_name: fullName,
          });

          set({
            user,
            session,
            isAuthenticated: !!user,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      // Sign out
      signOut: async () => {
        try {
          set({ isLoading: true, error: null });

          await AuthService.signOut();

          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      // Reset password
      resetPassword: async (email: string) => {
        try {
          set({ error: null });
          await AuthService.resetPassword(email);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
          set({ error: errorMessage });
          throw error;
        }
      },

      // Update password
      updatePassword: async (password: string) => {
        try {
          set({ isLoading: true, error: null });

          const user = await AuthService.updatePassword(password);

          set({
            user,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Password update failed';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      // Update profile
      updateProfile: async (updates: { full_name?: string; avatar_url?: string }) => {
        try {
          set({ isLoading: true, error: null });

          const user = await AuthService.updateProfile(updates);

          set({
            user,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      // Refresh session
      refreshSession: async () => {
        try {
          set({ isLoading: true, error: null });

          const session = await AuthService.refreshSession();

          set({
            session,
            user: session.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Session refresh failed';
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      // Error handling
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist these fields
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Auth state listener
export const initializeAuthListener = () => {
  AuthService.onAuthStateChange(async (event, session) => {
    console.log('Auth state changed:', event, session);

    const store = useAuthStore.getState();

    if (event === 'SIGNED_IN' && session) {
      store.setError(null);
      useAuthStore.setState({
        user: session.user,
        session,
        isAuthenticated: true,
        isLoading: false,
      });
    } else if (event === 'SIGNED_OUT') {
      useAuthStore.setState({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } else if (event === 'TOKEN_REFRESHED' && session) {
      useAuthStore.setState({
        session,
        user: session.user,
      });
    }
  });
};
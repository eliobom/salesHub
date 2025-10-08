import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { initializeAuthListener } from '../stores/authStore';

export const useAuth = () => {
  const {
    user,
    session,
    isLoading,
    isAuthenticated,
    error,
    initialize,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshSession,
    clearError,
  } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    initialize();
    initializeAuthListener();
  }, [initialize]);

  // Auto-refresh session when it expires
  useEffect(() => {
    if (session) {
      const expiresAt = session.expires_at;
      if (expiresAt) {
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = (expiresAt - now) * 1000;

        // Refresh 5 minutes before expiry
        const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 0);

        const timeoutId = setTimeout(() => {
          refreshSession();
        }, refreshTime);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [session, refreshSession]);

  // Memoized auth actions
  const login = useCallback(async (email: string, password: string) => {
    clearError();
    return await signIn(email, password);
  }, [signIn, clearError]);

  const register = useCallback(async (email: string, password: string, fullName?: string) => {
    clearError();
    return await signUp(email, password, fullName);
  }, [signUp, clearError]);

  const logout = useCallback(async () => {
    clearError();
    return await signOut();
  }, [signOut, clearError]);

  const forgotPassword = useCallback(async (email: string) => {
    clearError();
    return await resetPassword(email);
  }, [resetPassword, clearError]);

  const changePassword = useCallback(async (password: string) => {
    clearError();
    return await updatePassword(password);
  }, [updatePassword, clearError]);

  const updateUserProfile = useCallback(async (updates: { full_name?: string; avatar_url?: string }) => {
    clearError();
    return await updateProfile(updates);
  }, [updateProfile, clearError]);

  return {
    // State
    user,
    session,
    isLoading,
    isAuthenticated,
    error,

    // Actions
    login,
    register,
    logout,
    forgotPassword,
    changePassword,
    updateUserProfile,
    refreshSession,
    clearError,

    // Computed properties
    isAdmin: user?.user_metadata?.role === 'admin',
    userName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
    userAvatar: user?.user_metadata?.avatar_url,
  };
};
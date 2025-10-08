import { create } from 'zustand';

interface UiState {
  // Loading states
  isLoading: boolean;
  loadingMessage: string | null;

  // Modal states
  activeModal: string | null;
  modalData: any;

  // Toast notifications
  toast: {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  };

  // Navigation
  currentScreen: string;
  navigationHistory: string[];

  // UI preferences
  theme: 'light' | 'dark' | 'system';
  language: string;

  // Actions
  setLoading: (loading: boolean, message?: string | null) => void;
  showModal: (modalType: string, data?: any) => void;
  hideModal: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  hideToast: () => void;
  setCurrentScreen: (screen: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: string) => void;

  // Utility actions
  clearAll: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  // Initial state
  isLoading: false,
  loadingMessage: null,
  activeModal: null,
  modalData: null,
  toast: {
    visible: false,
    message: '',
    type: 'info',
  },
  currentScreen: '',
  navigationHistory: [],
  theme: 'system',
  language: 'en',

  // Loading actions
  setLoading: (loading: boolean, message: string | null = null) => {
    set({ isLoading: loading, loadingMessage: message });
  },

  // Modal actions
  showModal: (modalType: string, data: any = null) => {
    set({ activeModal: modalType, modalData: data });
  },

  hideModal: () => {
    set({ activeModal: null, modalData: null });
  },

  // Toast actions
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    set({
      toast: {
        visible: true,
        message,
        type,
      },
    });

    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      get().hideToast();
    }, 3000);
  },

  hideToast: () => {
    set({
      toast: {
        visible: false,
        message: '',
        type: 'info',
      },
    });
  },

  // Navigation actions
  setCurrentScreen: (screen: string) => {
    const state = get();
    set({
      currentScreen: screen,
      navigationHistory: [...state.navigationHistory.slice(-9), screen], // Keep last 10 screens
    });
  },

  // Theme actions
  setTheme: (theme: 'light' | 'dark' | 'system') => {
    set({ theme });
  },

  // Language actions
  setLanguage: (language: string) => {
    set({ language });
  },

  // Utility actions
  clearAll: () => {
    set({
      isLoading: false,
      loadingMessage: null,
      activeModal: null,
      modalData: null,
      toast: {
        visible: false,
        message: '',
        type: 'info',
      },
    });
  },
}));
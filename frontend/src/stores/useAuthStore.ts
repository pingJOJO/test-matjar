import { create } from 'zustand';
import { api, getAuthToken, setAuthToken, getOrCreateSessionId, UserProfile } from '@/lib/api';
import { useCartStore } from './useCartStore';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  initAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (idToken: string) => Promise<boolean>;
  register: (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  initAuth: async () => {
    const token = getAuthToken();
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const res = await api.getMe();
      if (res && res.data) {
        set({ user: res.data, isAuthenticated: true, isLoading: false, error: null });
      } else {
        setAuthToken(null);
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      setAuthToken(null);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.login({
        email,
        password,
        deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Browser',
      });

      if (res.success && res.data) {
        setAuthToken(res.data.tokens.accessToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('atoz_refresh_token', res.data.tokens.refreshToken);
        }
        set({
          user: res.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // Trigger cart sync & merge
        useCartStore.getState().fetchCart();
        return true;
      }
      set({ isLoading: false, error: 'Login failed' });
      return false;
    } catch (err: any) {
      const msg = err?.message || 'Invalid email or password';
      set({ isLoading: false, error: msg });
      throw new Error(msg);
    }
  },

  loginWithGoogle: async (idToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const guestSessionId = getOrCreateSessionId();
      const res = await api.loginWithGoogle({
        idToken,
        deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Browser',
        guestSessionId,
      });

      if (res.success && res.data) {
        setAuthToken(res.data.tokens.accessToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('atoz_refresh_token', res.data.tokens.refreshToken);
        }
        set({
          user: res.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // Refresh cart to show merged items
        useCartStore.getState().fetchCart();
        return true;
      }
      set({ isLoading: false, error: 'Google sign-in failed' });
      return false;
    } catch (err: any) {
      const msg = err?.message || 'Google sign-in failed';
      set({ isLoading: false, error: msg });
      throw new Error(msg);
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.register({
        ...data,
        deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Browser',
      });

      if (res.success && res.data) {
        setAuthToken(res.data.tokens.accessToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('atoz_refresh_token', res.data.tokens.refreshToken);
        }
        set({
          user: res.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        useCartStore.getState().fetchCart();
        return true;
      }
      set({ isLoading: false, error: 'Registration failed' });
      return false;
    } catch (err: any) {
      const msg = err?.message || 'Registration failed';
      set({ isLoading: false, error: msg });
      throw new Error(msg);
    }
  },

  logout: async () => {
    try {
      const refreshToken =
        typeof window !== 'undefined' ? localStorage.getItem('atoz_refresh_token') || '' : '';
      await api.logout(refreshToken).catch(() => null);
    } finally {
      setAuthToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('atoz_refresh_token');
      }
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
      useCartStore.getState().fetchCart();
    }
  },
}));

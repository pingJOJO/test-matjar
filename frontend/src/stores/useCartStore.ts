import { create } from 'zustand';
import { api, CartItemData, CartResponse } from '@/lib/api';

interface CartState {
  items: CartItemData[];
  itemCount: number;
  totalQuantity: number;
  subtotal: number;
  totalWeightKg: number;
  isLoading: boolean;
  isOpen: boolean;
  error: string | null;

  // Drawer Controls
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // API Synced Operations
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number) => Promise<boolean>;
  removeItem: (productId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
}

function calculateTotalWeight(items: CartItemData[]): number {
  return items.reduce((sum, item) => {
    const weight = Number(item.product?.weightKg) || 0;
    return sum + weight * item.quantity;
  }, 0);
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  itemCount: 0,
  totalQuantity: 0,
  subtotal: 0,
  totalWeightKg: 0,
  isLoading: false,
  isOpen: false,
  error: null,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.getCart();
      if (res.success && res.data) {
        const items = res.data.items || [];
        set({
          items,
          itemCount: res.data.itemCount || items.length,
          totalQuantity: res.data.totalQuantity || 0,
          subtotal: Number(res.data.subtotal) || 0,
          totalWeightKg: calculateTotalWeight(items),
          isLoading: false,
        });
      }
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  addItem: async (productId: string, quantity = 1) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.addToCart(productId, quantity);
      if (res.success && res.data) {
        const items = res.data.items || [];
        set({
          items,
          itemCount: res.data.itemCount || items.length,
          totalQuantity: res.data.totalQuantity || 0,
          subtotal: Number(res.data.subtotal) || 0,
          totalWeightKg: calculateTotalWeight(items),
          isLoading: false,
          isOpen: true, // Auto open drawer on add
        });
        return true;
      }
      return false;
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  updateQuantity: async (productId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.updateCartItem(productId, quantity);
      if (res.success && res.data) {
        const items = res.data.items || [];
        set({
          items,
          itemCount: res.data.itemCount || items.length,
          totalQuantity: res.data.totalQuantity || 0,
          subtotal: Number(res.data.subtotal) || 0,
          totalWeightKg: calculateTotalWeight(items),
          isLoading: false,
        });
        return true;
      }
      return false;
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
      return false;
    }
  },

  removeItem: async (productId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.removeCartItem(productId);
      if (res.success && res.data) {
        const items = res.data.items || [];
        set({
          items,
          itemCount: res.data.itemCount || items.length,
          totalQuantity: res.data.totalQuantity || 0,
          subtotal: Number(res.data.subtotal) || 0,
          totalWeightKg: calculateTotalWeight(items),
          isLoading: false,
        });
        return true;
      }
      return false;
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
      return false;
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.clearCart();
      set({
        items: [],
        itemCount: 0,
        totalQuantity: 0,
        subtotal: 0,
        totalWeightKg: 0,
        isLoading: false,
      });
      return true;
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
      return false;
    }
  },
}));

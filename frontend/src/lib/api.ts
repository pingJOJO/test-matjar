const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server-session';
  let sessionId = localStorage.getItem('atoz_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem('atoz_session_id', sessionId);
  }
  return sessionId;
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('atoz_access_token');
}

export function setAuthToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('atoz_access_token', token);
  } else {
    localStorage.removeItem('atoz_access_token');
  }
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers = new Headers(options.headers || {});

  // Add guest session tracking
  const sessionId = getOrCreateSessionId();
  if (!headers.has('x-session-id') && sessionId) {
    headers.set('x-session-id', sessionId);
  }

  // Add Bearer JWT if logged in
  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg =
      data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

// ----------------------------------------------------
// Typed API Endpoints
// ----------------------------------------------------

export interface ProductItem {
  id: string;
  sku: string;
  slug: string;
  title: string;
  description: string;
  shortDescription?: string;
  price: number | string;
  compareAtPrice?: number | string | null;
  costPrice?: number | string | null;
  lowStockAlert?: number;
  stock: number;
  reservedStock: number;
  weightKg?: number | string;
  attributes?: Record<string, any>;
  brand?: string;
  equipmentType?: string;
  engineBrand?: string;
  isFeatured: boolean;
  status: string;
  images: Array<{
    id: string;
    url: string;
    altText?: string;
    isPrimary: boolean;
  }>;
  category?: {
    id: string;
    name: string;
    slug: string;
    parent?: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string | null;
  children?: CategoryItem[];
  _count?: {
    products: number;
  };
}

export interface CartItemData {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number | string;
  totalPrice: number | string;
  product: ProductItem;
}

export interface CartResponse {
  id: string;
  sessionId?: string;
  userId?: string;
  itemCount: number;
  totalQuantity: number;
  subtotal: number;
  hasOutOfStockItems: boolean;
  items: CartItemData[];
}

export interface CustomerOrderItem {
  id: string;
  productId: string;
  productTitle: string;
  productSku: string;
  productImage: string | null;
  unitPrice: number | string;
  quantity: number;
  totalPrice: number | string;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  currency: string;
  subtotal: number | string;
  taxAmount: number | string;
  shippingAmount: number | string;
  discountAmount?: number | string;
  totalAmount: number | string;
  shippingAddress?: any;
  billingAddress?: any;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: CustomerOrderItem[];
  _count?: {
    items: number;
  };
}

export const api = {
  // Products
  async getProducts(params: {
    search?: string;
    categorySlug?: string;
    categoryId?: string;
    inStockOnly?: boolean;
    isFeatured?: boolean;
    brand?: string;
    equipmentType?: string;
    engineBrand?: string;
    page?: number;
    limit?: number;
    productSort?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.set('search', params.search);
    if (params.categorySlug) searchParams.set('categorySlug', params.categorySlug);
    if (params.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params.inStockOnly) searchParams.set('inStockOnly', 'true');
    if (params.isFeatured) searchParams.set('isFeatured', 'true');
    if (params.brand) searchParams.set('brand', params.brand);
    if (params.equipmentType) searchParams.set('equipmentType', params.equipmentType);
    if (params.engineBrand) searchParams.set('engineBrand', params.engineBrand);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.productSort) searchParams.set('productSort', params.productSort);

    const queryStr = searchParams.toString();
    const endpoint = `/products${queryStr ? `?${queryStr}` : ''}`;
    return apiFetch<{ success: boolean; data: ProductItem[]; meta: any }>(endpoint);
  },

  async getProduct(idOrSlugOrSku: string) {
    return apiFetch<{ success: boolean; data: ProductItem }>(`/products/${idOrSlugOrSku}`);
  },

  // Categories
  async getCategories() {
    return apiFetch<{ success: boolean; data: CategoryItem[] }>('/categories');
  },

  // Cart
  async getCart() {
    return apiFetch<{ success: boolean; data: CartResponse }>('/cart');
  },

  async addToCart(productId: string, quantity = 1) {
    return apiFetch<{ success: boolean; data: CartResponse }>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  async updateCartItem(productId: string, quantity: number) {
    return apiFetch<{ success: boolean; data: CartResponse }>(`/cart/items/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  },

  async removeCartItem(productId: string) {
    return apiFetch<{ success: boolean; data: CartResponse }>(`/cart/items/${productId}`, {
      method: 'DELETE',
    });
  },

  async clearCart() {
    return apiFetch<{ success: boolean }>('/cart', {
      method: 'DELETE',
    });
  },

  async mergeCart(guestSessionId: string) {
    return apiFetch<{ success: boolean; data: CartResponse }>('/cart/merge', {
      method: 'POST',
      body: JSON.stringify({ guestSessionId }),
    });
  },

  // Checkout & Orders
  async checkout(payload: {
    shippingAddress: {
      fullName: string;
      phone: string;
      streetLine1: string;
      city: string;
      country: string;
    };
    notes?: string;
    currency?: string;
  }) {
    return apiFetch<{ success: boolean; data: any }>('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getMyOrders(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    const qs = query.toString();
    return apiFetch<{
      success: boolean;
      data: CustomerOrder[];
      meta?: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    }>(`/orders${qs ? `?${qs}` : ''}`);
  },

  async getMyOrder(orderIdOrNumber: string) {
    return apiFetch<{ success: boolean; data: CustomerOrder }>(`/orders/${orderIdOrNumber}`);
  },

  // Payments
  async createPaymentIntent(orderId: string, provider: 'STRIPE' | 'PAYPAL') {
    const idempotencyKey = `web-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    return apiFetch<{ success: boolean; data: any }>('/payments/create-intent', {
      method: 'POST',
      headers: { 'idempotency-key': idempotencyKey },
      body: JSON.stringify({ orderId, provider, idempotencyKey }),
    });
  },

  async getPaymentStatus(orderId: string) {
    return apiFetch<{ success: boolean; data: any }>(`/payments/status/${orderId}`);
  },

  async getAdminAnalytics() {
    return apiFetch<{
      success: boolean;
      data: {
        overview: {
          totalRevenue: number;
          totalOrders: number;
          pendingOrders: number;
          processingOrders: number;
          shippedOrders: number;
          deliveredOrders: number;
          lowStockCount: number;
          outOfStockCount: number;
          totalProducts: number;
        };
        recentOrders: Array<{
          id: string;
          orderNumber: string;
          status: string;
          paymentStatus: string;
          totalAmount: number;
          customerEmail: string;
          customerName: string;
          companyName: string;
          itemCount: number;
          createdAt: string;
        }>;
        urgentLowStock: Array<{
          id: string;
          title: string;
          sku: string;
          stock: number;
          price: number;
          lowStockAlert: number;
          image: string | null;
        }>;
      };
    }>('/admin/analytics/overview');
  },

  async getAdminOrders(params: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'ALL') query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());

    const qs = query.toString();
    return apiFetch<{
      success: boolean;
      data: {
        orders: Array<{
          id: string;
          orderNumber: string;
          status: string;
          paymentStatus: string;
          subtotal: number;
          taxAmount: number;
          shippingAmount: number;
          totalAmount: number;
          customerEmail: string;
          customerPhone: string;
          customerName: string;
          companyName: string;
          taxNumber: string;
          siteLocation: string;
          trackingNumber?: string;
          notes?: string;
          totalWeightKg: number;
          itemsCount: number;
          items: Array<{
            id: string;
            productTitle: string;
            productSku: string;
            productImage?: string;
            unitPrice: number;
            quantity: number;
            totalPrice: number;
            oemNumber: string;
            weightKg: number;
          }>;
          createdAt: string;
          updatedAt: string;
        }>;
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      };
    }>(`/admin/orders${qs ? `?${qs}` : ''}`);
  },

  async updateAdminOrderStatus(
    id: string,
    payload: { status: string; trackingNumber?: string; notes?: string },
  ) {
    return apiFetch<{
      success: boolean;
      message: string;
      data: {
        order: {
          id: string;
          orderNumber: string;
          status: string;
          trackingNumber?: string;
          notes?: string;
          updatedAt: string;
        };
      };
    }>(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async quickUpdateProduct(
    id: string,
    payload: {
      price?: number;
      compareAtPrice?: number;
      costPrice?: number;
      stock?: number;
      lowStockAlert?: number;
    },
  ) {
    return apiFetch<{
      success: boolean;
      message: string;
      data: {
        product: {
          id: string;
          title: string;
          sku: string;
          price: number;
          compareAtPrice?: number | null;
          costPrice?: number | null;
          stock: number;
          lowStockAlert: number;
          status: string;
          updatedAt: string;
        };
      };
    }>(`/admin/products/${id}/quick-update`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async getAdminInvoices() {
    return apiFetch<{
      success: boolean;
      data: {
        totalInvoices: number;
        invoices: Array<{
          invoiceNumber: string;
          orderId: string;
          orderNumber: string;
          issueDate: string;
          dueDate: string;
          status: string;
          currency: string;
          seller: {
            name: string;
            nameEn: string;
            taxNumber: string;
            crNumber: string;
            address: string;
            phone: string;
            email: string;
          };
          buyer: {
            companyName: string;
            taxNumber: string;
            crNumber: string;
            contactPerson: string;
            phone: string;
            email: string;
            siteAddress: string;
          };
          logistics: {
            totalWeightKg: number;
            trackingNumber: string;
            shippingCarrier: string;
          };
          pricing: {
            subtotal: number;
            vatRate: number;
            vatAmount: number;
            shippingAmount: number;
            totalAmount: number;
          };
          items: Array<{
            sku: string;
            oemNumber: string;
            title: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            weightKg: number;
          }>;
        }>;
      };
    }>('/admin/invoices');
  },

  // ----------------------------------------------------
  // Authentication & Google OAuth Endpoints
  // ----------------------------------------------------
  async login(
    emailOrPayload: string | { email: string; password: string; deviceInfo?: string },
    optionalPassword?: string,
  ) {
    const payload =
      typeof emailOrPayload === 'string'
        ? { email: emailOrPayload, password: optionalPassword || '' }
        : emailOrPayload;

    const res = await apiFetch<{
      success: boolean;
      data: {
        user: UserProfile;
        tokens: {
          accessToken: string;
          refreshToken: string;
          tokenType: string;
          expiresIn: number;
        };
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.data?.tokens?.accessToken) {
      setAuthToken(res.data.tokens.accessToken);
    }
    return res;
  },

  async loginWithGoogle(payload: { idToken: string; deviceInfo?: string; guestSessionId?: string }) {
    return apiFetch<{
      success: boolean;
      data: {
        user: UserProfile;
        tokens: {
          accessToken: string;
          refreshToken: string;
          tokenType: string;
          expiresIn: number;
        };
      };
    }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async register(payload: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    deviceInfo?: string;
  }) {
    return apiFetch<{
      success: boolean;
      data: {
        user: UserProfile;
        tokens: {
          accessToken: string;
          refreshToken: string;
          tokenType: string;
          expiresIn: number;
        };
      };
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getMe() {
    return apiFetch<{
      success: boolean;
      data: UserProfile;
    }>('/auth/me');
  },

  async logout(refreshToken?: string) {
    return apiFetch<{
      success: boolean;
      message: string;
    }>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: refreshToken || '' }),
    });
  },
};

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPPORT';
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}


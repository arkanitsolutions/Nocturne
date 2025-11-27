import type { Product, CartItem, Order, WishlistItem, ProductReview } from "@shared/schema";

const API_BASE = "/api";

export const api = {
  // Products
  products: {
    getAll: async (): Promise<Product[]> => {
      const res = await fetch(`${API_BASE}/products`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
    
    getFeatured: async (): Promise<Product[]> => {
      const res = await fetch(`${API_BASE}/products/featured`);
      if (!res.ok) throw new Error("Failed to fetch featured products");
      return res.json();
    },
    
    getByCategory: async (category: string): Promise<Product[]> => {
      const res = await fetch(`${API_BASE}/products/category/${category}`);
      if (!res.ok) throw new Error("Failed to fetch products by category");
      return res.json();
    },
    
    getById: async (id: string): Promise<Product> => {
      const res = await fetch(`${API_BASE}/products/${id}`);
      if (!res.ok) throw new Error("Product not found");
      return res.json();
    },
  },
  
  // Cart
  cart: {
    get: async (userId: string): Promise<(CartItem & { product?: Product })[]> => {
      const res = await fetch(`${API_BASE}/cart/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch cart");
      return res.json();
    },
    
    add: async (userId: string, productId: string, quantity: number = 1, size?: string): Promise<CartItem> => {
      const res = await fetch(`${API_BASE}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId, quantity, size }),
      });
      if (!res.ok) throw new Error("Failed to add to cart");
      return res.json();
    },
    
    updateQuantity: async (id: string, quantity: number): Promise<CartItem> => {
      const res = await fetch(`${API_BASE}/cart/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error("Failed to update cart item");
      return res.json();
    },
    
    remove: async (id: string): Promise<void> => {
      const res = await fetch(`${API_BASE}/cart/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove from cart");
    },
    
    clear: async (userId: string): Promise<void> => {
      const res = await fetch(`${API_BASE}/cart/user/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to clear cart");
    },
  },
  
  // Orders
  orders: {
    get: async (userId: string): Promise<Order[]> => {
      const res = await fetch(`${API_BASE}/orders/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },

    getById: async (id: string): Promise<Order> => {
      const res = await fetch(`${API_BASE}/order/${id}`);
      if (!res.ok) throw new Error("Order not found");
      return res.json();
    },

    create: async (order: any, items: any[]): Promise<Order> => {
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order, items }),
      });
      if (!res.ok) throw new Error("Failed to create order");
      return res.json();
    },
  },

  // Wishlist
  wishlist: {
    get: async (userId: string): Promise<(WishlistItem & { product?: Product })[]> => {
      const res = await fetch(`${API_BASE}/wishlist/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch wishlist");
      return res.json();
    },

    add: async (userId: string, productId: string): Promise<WishlistItem> => {
      const res = await fetch(`${API_BASE}/wishlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId }),
      });
      if (!res.ok) throw new Error("Failed to add to wishlist");
      return res.json();
    },

    remove: async (id: string): Promise<void> => {
      const res = await fetch(`${API_BASE}/wishlist/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove from wishlist");
    },

    check: async (userId: string, productId: string): Promise<boolean> => {
      const res = await fetch(`${API_BASE}/wishlist/${userId}/check/${productId}`);
      if (!res.ok) return false;
      const data = await res.json();
      return data.isInWishlist;
    },
  },

  // Reviews
  reviews: {
    get: async (productId: string): Promise<ProductReview[]> => {
      const res = await fetch(`${API_BASE}/reviews/${productId}`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },

    create: async (review: {
      productId: string;
      userId: string;
      userName: string;
      userPhoto?: string;
      rating: number;
      comment: string;
    }): Promise<ProductReview> => {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(review),
      });
      if (!res.ok) throw new Error("Failed to create review");
      return res.json();
    },

    getRating: async (productId: string): Promise<{ average: number; count: number }> => {
      const res = await fetch(`${API_BASE}/reviews/${productId}/rating`);
      if (!res.ok) return { average: 0, count: 0 };
      return res.json();
    },
  },

  // Search
  search: async (query: string): Promise<Product[]> => {
    const res = await fetch(`${API_BASE}/products/search/${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Failed to search products");
    return res.json();
  },

  // Coupons
  coupons: {
    validate: async (code: string, orderTotal: number): Promise<{ valid: boolean; coupon?: any; discount?: number; error?: string }> => {
      const res = await fetch(`${API_BASE}/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, orderTotal }),
      });
      if (!res.ok) throw new Error("Failed to validate coupon");
      return res.json();
    },
  },

  // Payment
  payment: {
    createOrder: async (amount: number): Promise<any> => {
      const res = await fetch(`${API_BASE}/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency: "INR" }),
      });
      if (!res.ok) throw new Error("Failed to create payment order");
      return res.json();
    },

    verify: async (paymentData: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }): Promise<{ success: boolean; message: string }> => {
      const res = await fetch(`${API_BASE}/payment/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });
      if (!res.ok) throw new Error("Failed to verify payment");
      return res.json();
    },
  },
};

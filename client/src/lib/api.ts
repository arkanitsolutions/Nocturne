import type { Product, CartItem, Order } from "@shared/schema";

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
    
    add: async (userId: string, productId: string, quantity: number = 1): Promise<CartItem> => {
      const res = await fetch(`${API_BASE}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId, quantity }),
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
};

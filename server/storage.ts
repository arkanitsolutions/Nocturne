import {
  type Product,
  type InsertProduct,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type WishlistItem,
  type InsertWishlistItem,
  type ProductReview,
  type InsertProductReview,
  type Coupon,
  type InsertCoupon
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<void>;

  // Cart
  getCartItems(userId: string): Promise<CartItem[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<void>;
  clearCart(userId: string): Promise<void>;

  // Orders
  getOrders(userId: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string, trackingNumber?: string): Promise<Order | undefined>;

  // Order Items
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;

  // Wishlist
  getWishlistItems(userId: string): Promise<WishlistItem[]>;
  addToWishlist(item: InsertWishlistItem): Promise<WishlistItem>;
  removeFromWishlist(id: string): Promise<void>;
  isInWishlist(userId: string, productId: string): Promise<boolean>;

  // Reviews
  getProductReviews(productId: string): Promise<ProductReview[]>;
  createReview(review: InsertProductReview): Promise<ProductReview>;
  getProductRating(productId: string): Promise<{ average: number; count: number }>;

  // Coupons
  getCoupons(): Promise<Coupon[]>;
  getCoupon(id: string): Promise<Coupon | undefined>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  validateCoupon(code: string, orderTotal: number): Promise<{ valid: boolean; coupon?: Coupon; discount?: number; error?: string }>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: string, updates: Partial<InsertCoupon>): Promise<Coupon | undefined>;
  deleteCoupon(id: string): Promise<void>;
  incrementCouponUsage(code: string): Promise<void>;

  // Analytics
  getAnalytics(): Promise<{
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    recentOrders: Order[];
    topProducts: { productId: string; name: string; totalSold: number; revenue: number }[];
    salesByDay: { date: string; revenue: number; orders: number }[];
    ordersByStatus: { status: string; count: number }[];
  }>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private cartItems: Map<string, CartItem>;
  private orders: Map<string, Order>;
  private orderItems: Map<string, OrderItem>;
  private wishlistItems: Map<string, WishlistItem>;
  private productReviews: Map<string, ProductReview>;

  constructor() {
    this.products = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.wishlistItems = new Map();
    this.productReviews = new Map();
    this.seedProducts();
  }

  private seedProducts() {
    const sampleProducts: Product[] = [
      {
        id: randomUUID(),
        name: "Velvet Corset",
        description: "Bound in shadows, draped in night. Victorian elegance meets cyber-gothic perfection.",
        price: "450.00",
        image: "/assets/generated_images/luxury_black_velvet_corset_product_shot.png",
        category: "Corsets",
        stock: 5,
        featured: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Gothic Lace Gown",
        description: "Ethereal darkness embodied in delicate lace and flowing silk.",
        price: "850.00",
        image: "/assets/generated_images/luxury_black_velvet_corset_product_shot.png",
        category: "Dresses",
        stock: 3,
        featured: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Victorian Choker",
        description: "Sterling silver with obsidian accents. A statement of eternal elegance.",
        price: "180.00",
        image: "/assets/generated_images/3d_rendered_chrome_gothic_cross.png",
        category: "Jewelry",
        stock: 12,
        featured: false,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Shadow Cloak",
        description: "Midnight velvet with silver embroidered runes. Command the night.",
        price: "620.00",
        image: "/assets/generated_images/luxury_black_velvet_corset_product_shot.png",
        category: "Outerwear",
        stock: 7,
        featured: true,
        createdAt: new Date(),
      },
    ];

    sampleProducts.forEach(product => {
      this.products.set(product.id, product);
    });
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.category === category);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.featured);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { ...insertProduct, id, createdAt: new Date() };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (product) {
      const updated = { ...product, ...updates };
      this.products.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async deleteProduct(id: string): Promise<void> {
    this.products.delete(id);
  }

  async getCartItems(userId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(item => item.userId === userId);
  }

  async addToCart(insertItem: InsertCartItem): Promise<CartItem> {
    const id = randomUUID();
    const item: CartItem = { 
      ...insertItem, 
      id, 
      quantity: insertItem.quantity || 1,
      createdAt: new Date() 
    };
    this.cartItems.set(id, item);
    return item;
  }

  async updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (item) {
      item.quantity = quantity;
      this.cartItems.set(id, item);
    }
    return item;
  }

  async removeFromCart(id: string): Promise<void> {
    this.cartItems.delete(id);
  }

  async clearCart(userId: string): Promise<void> {
    const userItems = Array.from(this.cartItems.entries())
      .filter(([_, item]) => item.userId === userId);
    userItems.forEach(([id]) => this.cartItems.delete(id));
  }

  async getOrders(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = { 
      ...insertOrder, 
      id, 
      status: insertOrder.status || "pending",
      createdAt: new Date() 
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (order) {
      order.status = status;
      this.orders.set(id, order);
    }
    return order;
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  async createOrderItem(insertItem: InsertOrderItem): Promise<OrderItem> {
    const id = randomUUID();
    const item: OrderItem = { ...insertItem, id };
    this.orderItems.set(id, item);
    return item;
  }

  // Wishlist methods
  async getWishlistItems(userId: string): Promise<WishlistItem[]> {
    return Array.from(this.wishlistItems.values()).filter(item => item.userId === userId);
  }

  async addToWishlist(insertItem: InsertWishlistItem): Promise<WishlistItem> {
    const id = randomUUID();
    const item: WishlistItem = { ...insertItem, id, createdAt: new Date() };
    this.wishlistItems.set(id, item);
    return item;
  }

  async removeFromWishlist(id: string): Promise<void> {
    this.wishlistItems.delete(id);
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    return Array.from(this.wishlistItems.values()).some(
      item => item.userId === userId && item.productId === productId
    );
  }

  // Review methods
  async getProductReviews(productId: string): Promise<ProductReview[]> {
    return Array.from(this.productReviews.values())
      .filter(review => review.productId === productId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createReview(insertReview: InsertProductReview): Promise<ProductReview> {
    const id = randomUUID();
    const review: ProductReview = { ...insertReview, id, createdAt: new Date() };
    this.productReviews.set(id, review);
    return review;
  }

  async getProductRating(productId: string): Promise<{ average: number; count: number }> {
    const reviews = await this.getProductReviews(productId);
    if (reviews.length === 0) return { average: 0, count: 0 };

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return {
      average: Math.round((sum / reviews.length) * 10) / 10,
      count: reviews.length
    };
  }
}

// Storage selection logic:
// 1. If DATABASE_URL is set, use PostgreSQL (DatabaseStorage)
// 2. Otherwise, use in-memory storage (MemStorage)

let storage: IStorage;

if (process.env.DATABASE_URL) {
  // Dynamic import to avoid loading pg when not needed
  const { DatabaseStorage } = await import("./db-storage");
  storage = new DatabaseStorage();
  console.log("📦 Using PostgreSQL database storage");
} else {
  storage = new MemStorage();
  console.log("📦 Using In-Memory storage (data will be lost on restart!)");
  console.log("⚠️  Set DATABASE_URL to use PostgreSQL for persistent storage");
}

export { storage };

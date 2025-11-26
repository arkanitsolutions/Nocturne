import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, desc, and, sql } from 'drizzle-orm';
import {
  products,
  cartItems,
  orders,
  orderItems,
  wishlistItems,
  productReviews,
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
  type InsertProductReview
} from "@shared/schema";
import type { IStorage } from "./storage";

// Create database connection using Neon serverless driver
const connectionString = process.env.DATABASE_URL!;
const sql_client = neon(connectionString);
export const db = drizzle(sql_client);

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      // Create tables if they don't exist
      await this.createTables();

      // Check if products have valid images, reseed if needed
      const existingProducts = await db.select().from(products).limit(1);
      const needsReseed = existingProducts.length === 0 ||
        (existingProducts[0]?.image && existingProducts[0].image.startsWith('/assets'));

      if (needsReseed) {
        console.log("📦 Seeding database with sample products...");
        await this.seedProducts();
      }
      console.log("✅ Database initialized successfully");
    } catch (error) {
      console.error("❌ Database initialization error:", error);
    }
  }

  private async createTables() {
    // Create tables using raw SQL via the neon driver
    await sql_client`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        image TEXT NOT NULL,
        category TEXT NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql_client`
      CREATE TABLE IF NOT EXISTS cart_items (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL,
        product_id VARCHAR NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql_client`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        payment_method TEXT NOT NULL,
        payment_id TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql_client`
      CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id VARCHAR NOT NULL REFERENCES orders(id),
        product_id VARCHAR NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL
      )
    `;

    await sql_client`
      CREATE TABLE IF NOT EXISTS wishlist_items (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL,
        product_id VARCHAR NOT NULL REFERENCES products(id),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql_client`
      CREATE TABLE IF NOT EXISTS product_reviews (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id VARCHAR NOT NULL REFERENCES products(id),
        user_id VARCHAR NOT NULL,
        user_name TEXT NOT NULL,
        user_photo TEXT,
        rating INTEGER NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log("📋 Database tables created/verified");
  }

  private async seedProducts() {
    const sampleProducts: InsertProduct[] = [
      {
        name: "Velvet Corset",
        description: "Bound in shadows, draped in night. Victorian elegance meets cyber-gothic perfection.",
        price: "450.00",
        image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=1000&fit=crop",
        category: "Corsets",
        stock: 5,
        featured: true,
      },
      {
        name: "Gothic Lace Gown",
        description: "Ethereal darkness embodied in delicate lace and flowing silk.",
        price: "850.00",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop",
        category: "Dresses",
        stock: 3,
        featured: true,
      },
      {
        name: "Victorian Choker",
        description: "Sterling silver with obsidian accents. A statement of eternal elegance.",
        price: "180.00",
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=1000&fit=crop",
        category: "Jewelry",
        stock: 12,
        featured: false,
      },
      {
        name: "Shadow Cloak",
        description: "Midnight velvet with silver embroidered runes. Command the night.",
        price: "620.00",
        image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&h=1000&fit=crop",
        category: "Outerwear",
        stock: 7,
        featured: true,
      },
    ];

    // Clear existing products and insert fresh ones with correct images
    await db.delete(products);

    for (const product of sampleProducts) {
      await db.insert(products).values(product);
    }
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.category, category));
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.featured, true));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const result = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Cart
  async getCartItems(userId: string): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const result = await db.insert(cartItems).values(item).returning();
    return result[0];
  }

  async updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | undefined> {
    const result = await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id)).returning();
    return result[0];
  }

  async removeFromCart(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Orders
  async getOrders(userId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id));
    return result[0];
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(order).returning();
    return result[0];
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const result = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return result[0];
  }

  // Order Items
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const result = await db.insert(orderItems).values(item).returning();
    return result[0];
  }

  // Wishlist
  async getWishlistItems(userId: string): Promise<WishlistItem[]> {
    return await db.select().from(wishlistItems).where(eq(wishlistItems.userId, userId));
  }

  async addToWishlist(item: InsertWishlistItem): Promise<WishlistItem> {
    const result = await db.insert(wishlistItems).values(item).returning();
    return result[0];
  }

  async removeFromWishlist(id: string): Promise<void> {
    await db.delete(wishlistItems).where(eq(wishlistItems.id, id));
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const result = await db.select().from(wishlistItems)
      .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.productId, productId)));
    return result.length > 0;
  }

  // Reviews
  async getProductReviews(productId: string): Promise<ProductReview[]> {
    return await db.select().from(productReviews)
      .where(eq(productReviews.productId, productId))
      .orderBy(desc(productReviews.createdAt));
  }

  async createReview(review: InsertProductReview): Promise<ProductReview> {
    const result = await db.insert(productReviews).values(review).returning();
    return result[0];
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


import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, desc, and, sql, gte, lte, or, isNull } from 'drizzle-orm';
import {
  products,
  cartItems,
  orders,
  orderItems,
  wishlistItems,
  productReviews,
  coupons,
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
        sizes JSONB,
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Add sizes column if not exists
    await sql_client`ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes JSONB`;

    await sql_client`
      CREATE TABLE IF NOT EXISTS cart_items (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL,
        product_id VARCHAR NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL DEFAULT 1,
        size VARCHAR(10),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Add size column if not exists
    await sql_client`ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS size VARCHAR(10)`;

    await sql_client`
      CREATE TABLE IF NOT EXISTS coupons (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        discount_type VARCHAR(20) NOT NULL,
        discount_value DECIMAL(10, 2) NOT NULL,
        min_order_amount DECIMAL(10, 2) DEFAULT 0,
        max_discount DECIMAL(10, 2),
        usage_limit INTEGER,
        used_count INTEGER DEFAULT 0,
        valid_from TIMESTAMP DEFAULT NOW(),
        valid_until TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql_client`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL,
        user_email VARCHAR(255),
        user_name VARCHAR(255),
        total DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2),
        discount DECIMAL(10, 2) DEFAULT 0,
        coupon_code VARCHAR(50),
        status TEXT NOT NULL DEFAULT 'pending',
        payment_method TEXT NOT NULL,
        payment_id TEXT,
        shipping_name VARCHAR(255),
        shipping_phone VARCHAR(20),
        shipping_address TEXT,
        shipping_city VARCHAR(100),
        shipping_state VARCHAR(100),
        shipping_pincode VARCHAR(10),
        tracking_number VARCHAR(100),
        email_sent BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Add new columns if not exists
    await sql_client`ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_email VARCHAR(255)`;
    await sql_client`ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_name VARCHAR(255)`;
    await sql_client`ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2)`;
    await sql_client`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount DECIMAL(10, 2) DEFAULT 0`;
    await sql_client`ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50)`;
    await sql_client`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_name VARCHAR(255)`;
    await sql_client`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_phone VARCHAR(20)`;
    await sql_client`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT`;
    await sql_client`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100)`;
    await sql_client`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_state VARCHAR(100)`;
    await sql_client`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_pincode VARCHAR(10)`;
    await sql_client`ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100)`;
    await sql_client`ALTER TABLE orders ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false`;

    await sql_client`
      CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id VARCHAR NOT NULL REFERENCES orders(id),
        product_id VARCHAR NOT NULL REFERENCES products(id),
        product_name VARCHAR(255),
        product_image TEXT,
        quantity INTEGER NOT NULL,
        size VARCHAR(10),
        price DECIMAL(10, 2) NOT NULL
      )
    `;

    // Add new columns if not exists
    await sql_client`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_name VARCHAR(255)`;
    await sql_client`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_image TEXT`;
    await sql_client`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS size VARCHAR(10)`;

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
    const defaultSizes = { XS: 2, S: 5, M: 8, L: 6, XL: 3, XXL: 1 };

    const sampleProducts: InsertProduct[] = [
      {
        name: "Velvet Corset",
        description: "Bound in shadows, draped in night. Victorian elegance meets cyber-gothic perfection.",
        price: "450.00",
        image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=1000&fit=crop",
        category: "Corsets",
        stock: 25,
        sizes: defaultSizes,
        featured: true,
      },
      {
        name: "Gothic Lace Gown",
        description: "Ethereal darkness embodied in delicate lace and flowing silk.",
        price: "850.00",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop",
        category: "Dresses",
        stock: 18,
        sizes: { XS: 1, S: 3, M: 5, L: 5, XL: 3, XXL: 1 },
        featured: true,
      },
      {
        name: "Victorian Choker",
        description: "Sterling silver with obsidian accents. A statement of eternal elegance.",
        price: "180.00",
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=1000&fit=crop",
        category: "Jewelry",
        stock: 12,
        sizes: null, // Jewelry doesn't have sizes
        featured: false,
      },
      {
        name: "Shadow Cloak",
        description: "Midnight velvet with silver embroidered runes. Command the night.",
        price: "620.00",
        image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&h=1000&fit=crop",
        category: "Outerwear",
        stock: 20,
        sizes: { XS: 2, S: 4, M: 6, L: 5, XL: 2, XXL: 1 },
        featured: true,
      },
    ];

    // Clear existing data and insert fresh products with correct images
    // Delete in order to respect foreign key constraints
    await db.delete(cartItems);
    await db.delete(wishlistItems);
    await db.delete(productReviews);
    await db.delete(products);

    for (const product of sampleProducts) {
      await db.insert(products).values(product);
    }

    // Seed sample coupons
    await this.seedCoupons();
  }

  private async seedCoupons() {
    const existingCoupons = await db.select().from(coupons).limit(1);
    if (existingCoupons.length > 0) return;

    const sampleCoupons: InsertCoupon[] = [
      {
        code: "WELCOME20",
        description: "20% off on your first order",
        discountType: "percentage",
        discountValue: "20",
        minOrderAmount: "100",
        maxDiscount: "100",
        usageLimit: 100,
        isActive: true,
      },
      {
        code: "FLAT50",
        description: "$50 off on orders above $300",
        discountType: "fixed",
        discountValue: "50",
        minOrderAmount: "300",
        isActive: true,
      },
      {
        code: "GOTHIC10",
        description: "10% off on all gothic collection",
        discountType: "percentage",
        discountValue: "10",
        minOrderAmount: "0",
        maxDiscount: "50",
        isActive: true,
      },
    ];

    for (const coupon of sampleCoupons) {
      await db.insert(coupons).values(coupon);
    }
    console.log("🎟️ Sample coupons created");
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
    // Delete related records first (foreign key constraints)
    await db.delete(cartItems).where(eq(cartItems.productId, id));
    await db.delete(wishlistItems).where(eq(wishlistItems.productId, id));
    await db.delete(productReviews).where(eq(productReviews.productId, id));
    // Now delete the product
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

  // Coupons
  async getCoupons(): Promise<Coupon[]> {
    return await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  }

  async getCoupon(id: string): Promise<Coupon | undefined> {
    const result = await db.select().from(coupons).where(eq(coupons.id, id));
    return result[0];
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const result = await db.select().from(coupons)
      .where(eq(coupons.code, code.toUpperCase()));
    return result[0];
  }

  async validateCoupon(code: string, orderTotal: number): Promise<{ valid: boolean; coupon?: Coupon; discount?: number; error?: string }> {
    const coupon = await this.getCouponByCode(code);

    if (!coupon) {
      return { valid: false, error: "Invalid coupon code" };
    }

    if (!coupon.isActive) {
      return { valid: false, error: "This coupon is no longer active" };
    }

    if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
      return { valid: false, error: "This coupon has expired" };
    }

    if (coupon.usageLimit && coupon.usedCount && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, error: "This coupon has reached its usage limit" };
    }

    const minAmount = parseFloat(coupon.minOrderAmount?.toString() || "0");
    if (orderTotal < minAmount) {
      return { valid: false, error: `Minimum order amount is $${minAmount}` };
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (orderTotal * parseFloat(coupon.discountValue)) / 100;
      const maxDiscount = parseFloat(coupon.maxDiscount?.toString() || "999999");
      discount = Math.min(discount, maxDiscount);
    } else {
      discount = parseFloat(coupon.discountValue);
    }

    return { valid: true, coupon, discount: Math.round(discount * 100) / 100 };
  }

  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const result = await db.insert(coupons).values({
      ...coupon,
      code: coupon.code.toUpperCase(),
    }).returning();
    return result[0];
  }

  async updateCoupon(id: string, updates: Partial<InsertCoupon>): Promise<Coupon | undefined> {
    const result = await db.update(coupons).set(updates).where(eq(coupons.id, id)).returning();
    return result[0];
  }

  async deleteCoupon(id: string): Promise<void> {
    await db.delete(coupons).where(eq(coupons.id, id));
  }

  async incrementCouponUsage(code: string): Promise<void> {
    const coupon = await this.getCouponByCode(code);
    if (coupon) {
      await db.update(coupons)
        .set({ usedCount: (coupon.usedCount || 0) + 1 })
        .where(eq(coupons.id, coupon.id));
    }
  }

  // Analytics
  async getAnalytics(): Promise<{
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    recentOrders: Order[];
    topProducts: { productId: string; name: string; totalSold: number; revenue: number }[];
    salesByDay: { date: string; revenue: number; orders: number }[];
    ordersByStatus: { status: string; count: number }[];
  }> {
    // Total revenue
    const allOrders = await db.select().from(orders);
    const totalRevenue = allOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);

    // Total orders
    const totalOrders = allOrders.length;

    // Total products
    const allProducts = await db.select().from(products);
    const totalProducts = allProducts.length;

    // Unique customers
    const uniqueCustomers = new Set(allOrders.map(o => o.userId));
    const totalCustomers = uniqueCustomers.size;

    // Recent orders (last 10)
    const recentOrders = await db.select().from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(10);

    // Top products by sales
    const allOrderItems = await db.select().from(orderItems);
    const productSales: Record<string, { totalSold: number; revenue: number }> = {};

    for (const item of allOrderItems) {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { totalSold: 0, revenue: 0 };
      }
      productSales[item.productId].totalSold += item.quantity;
      productSales[item.productId].revenue += parseFloat(item.price) * item.quantity;
    }

    const topProducts = Object.entries(productSales)
      .map(([productId, data]) => {
        const product = allProducts.find(p => p.id === productId);
        return {
          productId,
          name: product?.name || 'Unknown',
          ...data
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Sales by day (last 7 days)
    const salesByDay: { date: string; revenue: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayOrders = allOrders.filter(o => {
        const orderDate = new Date(o.createdAt!).toISOString().split('T')[0];
        return orderDate === dateStr;
      });

      salesByDay.push({
        date: dateStr,
        revenue: dayOrders.reduce((sum, o) => sum + parseFloat(o.total), 0),
        orders: dayOrders.length
      });
    }

    // Orders by status
    const statusCounts: Record<string, number> = {};
    for (const order of allOrders) {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    }
    const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      totalProducts,
      totalCustomers,
      recentOrders,
      topProducts,
      salesByDay,
      ordersByStatus
    };
  }

  // Update order status with email notification
  async updateOrderStatus(id: string, status: string, trackingNumber?: string): Promise<Order | undefined> {
    const updates: any = { status };
    if (trackingNumber) {
      updates.trackingNumber = trackingNumber;
    }
    const result = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
    return result[0];
  }
}


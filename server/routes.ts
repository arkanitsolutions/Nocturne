import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import adminRouter, { verifyAdminToken } from "./admin";
import uploadRouter from "./upload";
import Razorpay from "razorpay";
import crypto from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  const {
    insertCartItemSchema,
    insertOrderSchema,
    insertOrderItemSchema,
    insertProductSchema,
    insertWishlistItemSchema,
    insertProductReviewSchema
  } = await import("@shared/schema");
  const { z } = await import("zod");

  // Admin routes
  app.use('/api', adminRouter);

  // Upload routes
  app.use('/api', uploadRouter);

  // Products
  app.get("/api/products", async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get("/api/products/featured", async (req, res) => {
    const products = await storage.getFeaturedProducts();
    res.json(products);
  });

  app.get("/api/products/category/:category", async (req, res) => {
    const products = await storage.getProductsByCategory(req.params.category);
    res.json(products);
  });

  app.get("/api/products/:id", async (req, res) => {
    const product = await storage.getProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  });

  // Admin: Create product
  app.post("/api/products", verifyAdminToken, async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  // Admin: Update product
  app.put("/api/products/:id", verifyAdminToken, async (req, res) => {
    try {
      const data = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, data);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  // Admin: Delete product
  app.delete("/api/products/:id", verifyAdminToken, async (req, res) => {
    await storage.deleteProduct(req.params.id);
    res.json({ success: true });
  });

  // Cart
  app.get("/api/cart/:userId", async (req, res) => {
    const items = await storage.getCartItems(req.params.userId);
    
    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        const product = await storage.getProduct(item.productId);
        return { ...item, product };
      })
    );
    
    res.json(itemsWithProducts);
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const data = insertCartItemSchema.parse(req.body);
      const item = await storage.addToCart(data);
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to add to cart" });
    }
  });

  app.patch("/api/cart/:id", async (req, res) => {
    const { quantity } = req.body;
    if (typeof quantity !== "number" || quantity < 1) {
      return res.status(400).json({ error: "Invalid quantity" });
    }
    
    const item = await storage.updateCartItemQuantity(req.params.id, quantity);
    if (!item) {
      return res.status(404).json({ error: "Cart item not found" });
    }
    
    res.json(item);
  });

  app.delete("/api/cart/:id", async (req, res) => {
    await storage.removeFromCart(req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/cart/user/:userId", async (req, res) => {
    await storage.clearCart(req.params.userId);
    res.json({ success: true });
  });

  // Orders
  app.get("/api/orders/:userId", async (req, res) => {
    const orders = await storage.getOrders(req.params.userId);
    res.json(orders);
  });

  app.get("/api/order/:id", async (req, res) => {
    const order = await storage.getOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    const items = await storage.getOrderItems(req.params.id);
    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        const product = await storage.getProduct(item.productId);
        return { ...item, product };
      })
    );
    
    res.json({ ...order, items: itemsWithProducts });
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body.order);
      const items = z.array(insertOrderItemSchema).parse(req.body.items);
      
      const order = await storage.createOrder(orderData);
      
      await Promise.all(
        items.map(item => storage.createOrderItem({ ...item, orderId: order.id }))
      );
      
      await storage.clearCart(orderData.userId);
      
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status required" });
    }

    const order = await storage.updateOrderStatus(req.params.id, status);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  });

  // Wishlist
  app.get("/api/wishlist/:userId", async (req, res) => {
    const items = await storage.getWishlistItems(req.params.userId);

    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        const product = await storage.getProduct(item.productId);
        return { ...item, product };
      })
    );

    res.json(itemsWithProducts);
  });

  app.post("/api/wishlist", async (req, res) => {
    try {
      const data = insertWishlistItemSchema.parse(req.body);
      const item = await storage.addToWishlist(data);
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to add to wishlist" });
    }
  });

  app.delete("/api/wishlist/:id", async (req, res) => {
    await storage.removeFromWishlist(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/wishlist/:userId/check/:productId", async (req, res) => {
    const isInWishlist = await storage.isInWishlist(req.params.userId, req.params.productId);
    res.json({ isInWishlist });
  });

  // Reviews
  app.get("/api/reviews/:productId", async (req, res) => {
    const reviews = await storage.getProductReviews(req.params.productId);
    res.json(reviews);
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const data = insertProductReviewSchema.parse(req.body);
      const review = await storage.createReview(data);
      res.json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  app.get("/api/reviews/:productId/rating", async (req, res) => {
    const rating = await storage.getProductRating(req.params.productId);
    res.json(rating);
  });

  // Search
  app.get("/api/products/search/:query", async (req, res) => {
    const query = req.params.query.toLowerCase();
    const allProducts = await storage.getProducts();

    const results = allProducts.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    );

    res.json(results);
  });

  // Razorpay Payment Routes
  // Initialize Razorpay (use test keys for now)
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_demo_key",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "demo_secret",
  });

  // Create Razorpay order
  app.post("/api/payment/create-order", async (req, res) => {
    try {
      const { amount, currency = "INR" } = req.body;

      const options = {
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency,
        receipt: `receipt_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error: any) {
      console.error("Razorpay order creation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Verify Razorpay payment
  app.post("/api/payment/verify", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "demo_secret")
        .update(sign.toString())
        .digest("hex");

      if (razorpay_signature === expectedSign) {
        res.json({ success: true, message: "Payment verified successfully" });
      } else {
        res.status(400).json({ success: false, message: "Invalid signature" });
      }
    } catch (error: any) {
      console.error("Payment verification error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

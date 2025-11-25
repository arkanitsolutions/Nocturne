import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  const { insertCartItemSchema, insertOrderSchema, insertOrderItemSchema } = await import("@shared/schema");
  const { z } = await import("zod");

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

  const httpServer = createServer(app);

  return httpServer;
}

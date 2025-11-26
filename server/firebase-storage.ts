import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import {
  type Product,
  type InsertProduct,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem
} from "@shared/schema";
import { randomUUID } from "crypto";
import type { IStorage } from "./storage";

// Initialize Firebase Client SDK (works without service account)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig, 'server-app');
const db = getFirestore(app);

export class FirebaseStorage implements IStorage {
  private productsCol = collection(db, 'products');
  private cartItemsCol = collection(db, 'cartItems');
  private ordersCol = collection(db, 'orders');
  private orderItemsCol = collection(db, 'orderItems');

  constructor() {
    this.seedProducts();
  }

  private async seedProducts() {
    // Check if products already exist
    const snapshot = await getDocs(this.productsCol);
    if (!snapshot.empty) {
      console.log('✅ Products already seeded in Firestore');
      return;
    }

    console.log('🌱 Seeding products to Firestore...');
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
        price: "380.00",
        image: "/assets/generated_images/luxury_black_velvet_corset_product_shot.png",
        category: "Jewelry",
        stock: 10,
        featured: false,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Midnight Cloak",
        description: "Flowing velvet cape with crimson silk lining. Command the night.",
        price: "520.00",
        image: "/assets/generated_images/luxury_black_velvet_corset_product_shot.png",
        category: "Outerwear",
        stock: 7,
        featured: true,
        createdAt: new Date(),
      },
    ];

    // Add products one by one
    for (const product of sampleProducts) {
      await setDoc(doc(this.productsCol, product.id), product);
    }
    console.log('✅ Seeded 4 products to Firestore');
  }

  async getProducts(): Promise<Product[]> {
    const snapshot = await getDocs(this.productsCol);
    return snapshot.docs.map(doc => doc.data() as Product);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const docRef = doc(this.productsCol, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as Product : undefined;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const q = query(this.productsCol, where('category', '==', category));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Product);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const q = query(this.productsCol, where('featured', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Product);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { ...insertProduct, id, createdAt: new Date() };
    await setDoc(doc(this.productsCol, id), product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const docRef = doc(this.productsCol, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return undefined;

    const updated = { ...docSnap.data(), ...updates };
    await updateDoc(docRef, updates as any);
    return updated as Product;
  }

  async deleteProduct(id: string): Promise<void> {
    await deleteDoc(doc(this.productsCol, id));
  }

  async getCartItems(userId: string): Promise<CartItem[]> {
    const q = query(this.cartItemsCol, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as CartItem);
  }

  async addToCart(insertItem: InsertCartItem): Promise<CartItem> {
    const id = randomUUID();
    const item: CartItem = {
      ...insertItem,
      id,
      quantity: insertItem.quantity || 1,
      createdAt: new Date()
    };
    await setDoc(doc(this.cartItemsCol, id), item);
    return item;
  }

  async updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | undefined> {
    const docRef = doc(this.cartItemsCol, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return undefined;

    await updateDoc(docRef, { quantity });
    const updated = await getDoc(docRef);
    return updated.data() as CartItem;
  }

  async removeFromCart(id: string): Promise<void> {
    await deleteDoc(doc(this.cartItemsCol, id));
  }

  async clearCart(userId: string): Promise<void> {
    const q = query(this.cartItemsCol, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    // Delete each document
    for (const docSnap of snapshot.docs) {
      await deleteDoc(docSnap.ref);
    }
  }

  async getOrders(userId: string): Promise<Order[]> {
    const q = query(this.ordersCol, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Order);
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const docRef = doc(this.ordersCol, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as Order : undefined;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = { ...insertOrder, id, createdAt: new Date() };
    await setDoc(doc(this.ordersCol, id), order);
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const docRef = doc(this.ordersCol, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return undefined;

    await updateDoc(docRef, { status });
    const updated = await getDoc(docRef);
    return updated.data() as Order;
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const q = query(this.orderItemsCol, where('orderId', '==', orderId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as OrderItem);
  }

  async createOrderItem(insertItem: InsertOrderItem): Promise<OrderItem> {
    const id = randomUUID();
    const item: OrderItem = { ...insertItem, id };
    await setDoc(doc(this.orderItemsCol, id), item);
    return item;
  }
}


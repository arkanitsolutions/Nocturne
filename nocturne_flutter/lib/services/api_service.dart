import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/product.dart';
import '../models/cart_item.dart';
import '../models/order.dart';

class ApiService {
  // Change this to your backend URL
  // For local development: http://10.0.2.2:5000 (Android Emulator)
  // For local development: http://localhost:5000 (iOS Simulator)
  // For production: https://your-backend-url.com
  static const String baseUrl = 'http://10.0.2.2:5000';
  
  // Products
  static Future<List<Product>> getProducts() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/products'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => Product.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load products');
      }
    } catch (e) {
      throw Exception('Error fetching products: $e');
    }
  }

  static Future<Product> getProduct(String id) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/products/$id'),
      );

      if (response.statusCode == 200) {
        return Product.fromJson(json.decode(response.body));
      } else {
        throw Exception('Failed to load product');
      }
    } catch (e) {
      throw Exception('Error fetching product: $e');
    }
  }

  // Cart
  static Future<List<CartItem>> getCart(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/cart/$userId'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => CartItem.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load cart');
      }
    } catch (e) {
      throw Exception('Error fetching cart: $e');
    }
  }

  static Future<CartItem> addToCart(String userId, String productId, int quantity) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/cart'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'userId': userId,
          'productId': productId,
          'quantity': quantity,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return CartItem.fromJson(json.decode(response.body));
      } else {
        throw Exception('Failed to add to cart');
      }
    } catch (e) {
      throw Exception('Error adding to cart: $e');
    }
  }

  static Future<void> updateCartQuantity(String cartItemId, int quantity) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/api/cart/$cartItemId'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'quantity': quantity}),
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to update cart');
      }
    } catch (e) {
      throw Exception('Error updating cart: $e');
    }
  }

  static Future<void> removeFromCart(String cartItemId) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/api/cart/$cartItemId'),
      );

      if (response.statusCode != 200 && response.statusCode != 204) {
        throw Exception('Failed to remove from cart');
      }
    } catch (e) {
      throw Exception('Error removing from cart: $e');
    }
  }

  // Orders
  static Future<List<Order>> getOrders(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/orders/$userId'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => Order.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load orders');
      }
    } catch (e) {
      throw Exception('Error fetching orders: $e');
    }
  }

  static Future<Order> createOrder(Map<String, dynamic> orderData) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/orders'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(orderData),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return Order.fromJson(json.decode(response.body));
      } else {
        throw Exception('Failed to create order');
      }
    } catch (e) {
      throw Exception('Error creating order: $e');
    }
  }
}


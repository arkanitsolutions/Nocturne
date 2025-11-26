import 'package:flutter/material.dart';
import '../models/cart_item.dart';
import '../services/api_service.dart';

class CartProvider with ChangeNotifier {
  List<CartItem> _items = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<CartItem> get items => _items;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  
  int get itemCount => _items.fold(0, (sum, item) => sum + item.quantity);
  
  double get totalAmount {
    return _items.fold(0.0, (sum, item) => sum + item.totalPrice);
  }

  Future<void> fetchCart(String userId) async {
    try {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();

      _items = await ApiService.getCart(userId);
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> addToCart(String userId, String productId, int quantity) async {
    try {
      _errorMessage = null;
      
      final cartItem = await ApiService.addToCart(userId, productId, quantity);
      
      // Check if item already exists
      final existingIndex = _items.indexWhere((item) => item.id == cartItem.id);
      if (existingIndex >= 0) {
        _items[existingIndex] = cartItem;
      } else {
        _items.add(cartItem);
      }
      
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateQuantity(String cartItemId, int quantity) async {
    try {
      _errorMessage = null;
      
      if (quantity <= 0) {
        return await removeFromCart(cartItemId);
      }
      
      await ApiService.updateCartQuantity(cartItemId, quantity);
      
      final index = _items.indexWhere((item) => item.id == cartItemId);
      if (index >= 0) {
        _items[index] = CartItem(
          id: _items[index].id,
          userId: _items[index].userId,
          productId: _items[index].productId,
          quantity: quantity,
          product: _items[index].product,
          createdAt: _items[index].createdAt,
        );
      }
      
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> removeFromCart(String cartItemId) async {
    try {
      _errorMessage = null;
      
      await ApiService.removeFromCart(cartItemId);
      _items.removeWhere((item) => item.id == cartItemId);
      
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  void clearCart() {
    _items = [];
    notifyListeners();
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}


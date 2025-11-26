import 'package:flutter/material.dart';
import '../models/product.dart';
import '../services/api_service.dart';

class ProductsProvider with ChangeNotifier {
  List<Product> _products = [];
  bool _isLoading = false;
  String? _errorMessage;
  String? _selectedCategory;

  List<Product> get products => _selectedCategory == null
      ? _products
      : _products.where((p) => p.category == _selectedCategory).toList();
  
  List<Product> get allProducts => _products;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String? get selectedCategory => _selectedCategory;
  
  List<String> get categories {
    return _products.map((p) => p.category).toSet().toList();
  }

  Future<void> fetchProducts() async {
    try {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();

      _products = await ApiService.getProducts();
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  void setCategory(String? category) {
    _selectedCategory = category;
    notifyListeners();
  }

  Product? getProductById(String id) {
    try {
      return _products.firstWhere((p) => p.id == id);
    } catch (e) {
      return null;
    }
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}


import 'product.dart';

class CartItem {
  final String id;
  final String userId;
  final String productId;
  final int quantity;
  final Product? product;
  final DateTime? createdAt;

  CartItem({
    required this.id,
    required this.userId,
    required this.productId,
    required this.quantity,
    this.product,
    this.createdAt,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      id: json['id'] as String,
      userId: json['userId'] as String,
      productId: json['productId'] as String,
      quantity: json['quantity'] as int,
      product: json['product'] != null 
          ? Product.fromJson(json['product'] as Map<String, dynamic>)
          : null,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'productId': productId,
      'quantity': quantity,
      'product': product?.toJson(),
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  double get totalPrice {
    if (product == null) return 0.0;
    return product!.price * quantity;
  }
}


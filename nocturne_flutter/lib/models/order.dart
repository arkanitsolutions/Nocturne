class Order {
  final String id;
  final String userId;
  final double total;
  final String status;
  final String paymentMethod;
  final String? paymentId;
  final DateTime? createdAt;
  final List<OrderItem>? items;

  Order({
    required this.id,
    required this.userId,
    required this.total,
    required this.status,
    required this.paymentMethod,
    this.paymentId,
    this.createdAt,
    this.items,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] as String,
      userId: json['userId'] as String,
      total: double.parse(json['total'].toString()),
      status: json['status'] as String,
      paymentMethod: json['paymentMethod'] as String,
      paymentId: json['paymentId'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : null,
      items: json['items'] != null
          ? (json['items'] as List)
              .map((item) => OrderItem.fromJson(item as Map<String, dynamic>))
              .toList()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'total': total.toString(),
      'status': status,
      'paymentMethod': paymentMethod,
      'paymentId': paymentId,
      'createdAt': createdAt?.toIso8601String(),
      'items': items?.map((item) => item.toJson()).toList(),
    };
  }
}

class OrderItem {
  final String id;
  final String orderId;
  final String productId;
  final int quantity;
  final double price;

  OrderItem({
    required this.id,
    required this.orderId,
    required this.productId,
    required this.quantity,
    required this.price,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id: json['id'] as String,
      orderId: json['orderId'] as String,
      productId: json['productId'] as String,
      quantity: json['quantity'] as int,
      price: double.parse(json['price'].toString()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'orderId': orderId,
      'productId': productId,
      'quantity': quantity,
      'price': price.toString(),
    };
  }
}


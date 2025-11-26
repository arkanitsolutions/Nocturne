class Product {
  final String id;
  final String name;
  final String description;
  final double price;
  final String image;
  final String category;
  final int stock;
  final bool featured;
  final DateTime? createdAt;

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.image,
    required this.category,
    required this.stock,
    this.featured = false,
    this.createdAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      price: double.parse(json['price'].toString()),
      image: json['image'] as String,
      category: json['category'] as String,
      stock: json['stock'] as int? ?? 0,
      featured: json['featured'] as bool? ?? false,
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'price': price.toString(),
      'image': image,
      'category': category,
      'stock': stock,
      'featured': featured,
      'createdAt': createdAt?.toIso8601String(),
    };
  }
}


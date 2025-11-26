import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../providers/products_provider.dart';
import '../providers/auth_provider.dart';
import '../providers/cart_provider.dart';

class ProductDetailScreen extends StatelessWidget {
  final String productId;

  const ProductDetailScreen({super.key, required this.productId});

  @override
  Widget build(BuildContext context) {
    final productsProvider = context.watch<ProductsProvider>();
    final authProvider = context.watch<AuthProvider>();
    final cartProvider = context.watch<CartProvider>();
    final theme = Theme.of(context);
    
    final product = productsProvider.getProductById(productId);

    if (product == null) {
      return Scaffold(
        appBar: AppBar(),
        body: const Center(child: Text('Product not found')),
      );
    }

    final cartItem = cartProvider.items.firstWhere(
      (item) => item.productId == product.id,
      orElse: () => null as dynamic,
    );
    final currentQuantity = cartItem?.quantity ?? 0;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/'),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Product Image
                  AspectRatio(
                    aspectRatio: 1,
                    child: CachedNetworkImage(
                      imageUrl: product.image,
                      fit: BoxFit.cover,
                    ),
                  ),
                  
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          product.category.toUpperCase(),
                          style: theme.textTheme.bodyMedium?.copyWith(
                            letterSpacing: 2,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          product.name,
                          style: theme.textTheme.displayMedium,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          '₹${product.price.toStringAsFixed(0)}',
                          style: theme.textTheme.displayLarge?.copyWith(
                            fontSize: 28,
                          ),
                        ),
                        const SizedBox(height: 24),
                        Text(
                          'DESCRIPTION',
                          style: theme.textTheme.labelLarge,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          product.description,
                          style: theme.textTheme.bodyLarge,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          // Bottom Add to Cart
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: theme.cardTheme.color,
              border: Border(
                top: BorderSide(
                  color: Colors.white.withOpacity(0.1),
                ),
              ),
            ),
            child: SafeArea(
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    final user = authProvider.user;
                    if (user == null) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Please sign in to add items'),
                          backgroundColor: Colors.red,
                        ),
                      );
                      return;
                    }
                    cartProvider.addToCart(user.uid, product.id, 1);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Added to cart'),
                        backgroundColor: Colors.green,
                      ),
                    );
                  },
                  child: Text(
                    currentQuantity > 0
                        ? 'ADD MORE ($currentQuantity IN CART)'
                        : 'ADD TO CART',
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}


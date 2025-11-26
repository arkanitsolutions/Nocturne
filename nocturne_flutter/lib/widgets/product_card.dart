import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/product.dart';
import '../providers/auth_provider.dart';
import '../providers/cart_provider.dart';

class ProductCard extends StatelessWidget {
  final Product product;

  const ProductCard({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final authProvider = context.watch<AuthProvider>();
    final cartProvider = context.watch<CartProvider>();
    
    final cartItem = cartProvider.items.cast<dynamic>().firstWhere(
      (item) => item?.productId == product.id,
      orElse: () => null,
    );
    final currentQuantity = cartItem?.quantity ?? 0;

    return GestureDetector(
      onTap: () {
        context.go('/product/${product.id}');
      },
      child: Container(
        decoration: BoxDecoration(
          color: theme.cardTheme.color,
          border: Border.all(
            color: Colors.white.withOpacity(0.1),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product Image
            Expanded(
              child: Container(
                width: double.infinity,
                color: Colors.black,
                child: CachedNetworkImage(
                  imageUrl: product.image,
                  fit: BoxFit.cover,
                  placeholder: (context, url) => Center(
                    child: CircularProgressIndicator(
                      color: Colors.white.withOpacity(0.3),
                      strokeWidth: 2,
                    ),
                  ),
                  errorWidget: (context, url, error) => Icon(
                    Icons.image_not_supported,
                    color: Colors.white.withOpacity(0.2),
                    size: 48,
                  ),
                ),
              ),
            ),

            // Product Info
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontSize: 14,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    product.category.toUpperCase(),
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontSize: 10,
                      letterSpacing: 1,
                      color: Colors.white.withOpacity(0.4),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '₹${product.price.toStringAsFixed(0)}',
                        style: theme.textTheme.headlineMedium?.copyWith(
                          fontSize: 16,
                        ),
                      ),
                      if (currentQuantity > 0)
                        Row(
                          children: [
                            _buildIconButton(
                              icon: Icons.remove,
                              onPressed: () {
                                if (cartItem != null) {
                                  cartProvider.updateQuantity(
                                    cartItem.id,
                                    currentQuantity - 1,
                                  );
                                }
                              },
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 8),
                              child: Text(
                                '$currentQuantity',
                                style: theme.textTheme.labelLarge,
                              ),
                            ),
                            _buildIconButton(
                              icon: Icons.add,
                              onPressed: () {
                                if (cartItem != null) {
                                  cartProvider.updateQuantity(
                                    cartItem.id,
                                    currentQuantity + 1,
                                  );
                                }
                              },
                            ),
                          ],
                        )
                      else
                        _buildIconButton(
                          icon: Icons.add,
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
                          },
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildIconButton({
    required IconData icon,
    required VoidCallback onPressed,
  }) {
    return InkWell(
      onTap: onPressed,
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: Colors.white),
        ),
        child: Icon(
          icon,
          size: 16,
          color: Colors.black,
        ),
      ),
    );
  }
}


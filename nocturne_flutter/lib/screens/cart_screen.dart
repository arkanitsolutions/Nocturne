import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../providers/cart_provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/bottom_nav_bar.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final cartProvider = context.watch<CartProvider>();
    final authProvider = context.watch<AuthProvider>();
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('CART'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/'),
        ),
      ),
      body: authProvider.user == null
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.shopping_bag_outlined,
                    size: 64,
                    color: Colors.white.withOpacity(0.2),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Please sign in to view cart',
                    style: theme.textTheme.bodyLarge?.copyWith(
                      color: Colors.white.withOpacity(0.6),
                    ),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () => context.go('/'),
                    child: const Text('GO TO SHOP'),
                  ),
                ],
              ),
            )
          : cartProvider.items.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.shopping_bag_outlined,
                        size: 64,
                        color: Colors.white.withOpacity(0.2),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Your cart is empty',
                        style: theme.textTheme.bodyLarge?.copyWith(
                          color: Colors.white.withOpacity(0.6),
                        ),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: () => context.go('/'),
                        child: const Text('START SHOPPING'),
                      ),
                    ],
                  ),
                )
              : Column(
                  children: [
                    Expanded(
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: cartProvider.items.length,
                        itemBuilder: (context, index) {
                          final item = cartProvider.items[index];
                          final product = item.product;

                          if (product == null) return const SizedBox();

                          return Container(
                            margin: const EdgeInsets.only(bottom: 16),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: theme.cardTheme.color,
                              border: Border.all(
                                color: Colors.white.withOpacity(0.1),
                              ),
                            ),
                            child: Row(
                              children: [
                                // Product Image
                                Container(
                                  width: 80,
                                  height: 80,
                                  color: Colors.black,
                                  child: CachedNetworkImage(
                                    imageUrl: product.image,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                // Product Info
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        product.name,
                                        style: theme.textTheme.titleLarge,
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        '₹${product.price.toStringAsFixed(0)}',
                                        style: theme.textTheme.headlineMedium,
                                      ),
                                    ],
                                  ),
                                ),
                                // Quantity Controls
                                Column(
                                  children: [
                                    Row(
                                      children: [
                                        _buildIconButton(
                                          icon: Icons.remove,
                                          onPressed: () {
                                            cartProvider.updateQuantity(
                                              item.id,
                                              item.quantity - 1,
                                            );
                                          },
                                        ),
                                        Padding(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 12),
                                          child: Text(
                                            '${item.quantity}',
                                            style: theme.textTheme.labelLarge,
                                          ),
                                        ),
                                        _buildIconButton(
                                          icon: Icons.add,
                                          onPressed: () {
                                            cartProvider.updateQuantity(
                                              item.id,
                                              item.quantity + 1,
                                            );
                                          },
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    TextButton(
                                      onPressed: () {
                                        cartProvider.removeFromCart(item.id);
                                      },
                                      child: Text(
                                        'REMOVE',
                                        style: theme.textTheme.labelLarge?.copyWith(
                                          fontSize: 10,
                                          color: Colors.red,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                    // Bottom Total & Checkout
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
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'TOTAL',
                                  style: theme.textTheme.labelLarge,
                                ),
                                Text(
                                  '₹${cartProvider.totalAmount.toStringAsFixed(0)}',
                                  style: theme.textTheme.displaySmall,
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: () => context.go('/checkout'),
                                child: const Text('PROCEED TO CHECKOUT'),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
      bottomNavigationBar: const BottomNavBar(currentIndex: 2),
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


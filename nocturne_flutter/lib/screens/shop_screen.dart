import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../providers/products_provider.dart';
import '../providers/cart_provider.dart';
import '../widgets/product_card.dart';
import '../widgets/category_chips.dart';
import '../widgets/bottom_nav_bar.dart';

class ShopScreen extends StatefulWidget {
  const ShopScreen({super.key});

  @override
  State<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends State<ShopScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ProductsProvider>().fetchProducts();
      final user = context.read<AuthProvider>().user;
      if (user != null) {
        context.read<CartProvider>().fetchCart(user.uid);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final productsProvider = context.watch<ProductsProvider>();
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: theme.scaffoldBackgroundColor,
                border: Border(
                  bottom: BorderSide(
                    color: Colors.white.withOpacity(0.1),
                  ),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'NOCTURNE',
                        style: theme.textTheme.displayLarge?.copyWith(
                          fontSize: 28,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'LUXURY DARKNESS',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          fontSize: 10,
                          letterSpacing: 3,
                          color: Colors.white.withOpacity(0.4),
                        ),
                      ),
                    ],
                  ),
                  if (authProvider.user != null)
                    Row(
                      children: [
                        if (authProvider.user!.photoURL != null)
                          CircleAvatar(
                            radius: 16,
                            backgroundImage: NetworkImage(
                              authProvider.user!.photoURL!,
                            ),
                          ),
                        const SizedBox(width: 12),
                        TextButton(
                          onPressed: () => authProvider.signOut(),
                          child: Text(
                            'SIGN OUT',
                            style: theme.textTheme.labelLarge?.copyWith(
                              fontSize: 10,
                              color: Colors.white.withOpacity(0.6),
                            ),
                          ),
                        ),
                      ],
                    )
                  else
                    ElevatedButton(
                      onPressed: () => authProvider.signInWithGoogle(),
                      child: const Text('SIGN IN'),
                    ),
                ],
              ),
            ),

            // Categories
            if (productsProvider.categories.isNotEmpty)
              CategoryChips(
                categories: productsProvider.categories,
                selectedCategory: productsProvider.selectedCategory,
                onCategorySelected: (category) {
                  productsProvider.setCategory(category);
                },
              ),

            // Products Grid
            Expanded(
              child: productsProvider.isLoading
                  ? const Center(
                      child: CircularProgressIndicator(
                        color: Colors.white,
                      ),
                    )
                  : productsProvider.products.isEmpty
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
                                'No products found',
                                style: theme.textTheme.bodyLarge?.copyWith(
                                  color: Colors.white.withOpacity(0.4),
                                ),
                              ),
                            ],
                          ),
                        )
                      : GridView.builder(
                          padding: const EdgeInsets.all(16),
                          gridDelegate:
                              const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            childAspectRatio: 0.65,
                            crossAxisSpacing: 16,
                            mainAxisSpacing: 16,
                          ),
                          itemCount: productsProvider.products.length,
                          itemBuilder: (context, index) {
                            return ProductCard(
                              product: productsProvider.products[index],
                            );
                          },
                        ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: const BottomNavBar(currentIndex: 0),
    );
  }
}


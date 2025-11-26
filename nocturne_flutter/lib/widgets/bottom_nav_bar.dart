import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../providers/cart_provider.dart';

class BottomNavBar extends StatelessWidget {
  final int currentIndex;

  const BottomNavBar({super.key, required this.currentIndex});

  @override
  Widget build(BuildContext context) {
    final cartProvider = context.watch<CartProvider>();
    final theme = Theme.of(context);

    return Container(
      decoration: BoxDecoration(
        color: theme.scaffoldBackgroundColor,
        border: Border(
          top: BorderSide(
            color: Colors.white.withOpacity(0.1),
          ),
        ),
      ),
      child: SafeArea(
        child: SizedBox(
          height: 65,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(
                context,
                icon: Icons.home_outlined,
                selectedIcon: Icons.home,
                label: 'Shop',
                index: 0,
                onTap: () => context.go('/'),
              ),
              _buildNavItem(
                context,
                icon: Icons.search_outlined,
                selectedIcon: Icons.search,
                label: 'Search',
                index: 1,
                onTap: () {},
              ),
              _buildNavItem(
                context,
                icon: Icons.shopping_bag_outlined,
                selectedIcon: Icons.shopping_bag,
                label: 'Cart',
                index: 2,
                badge: cartProvider.itemCount,
                onTap: () => context.go('/cart'),
              ),
              _buildNavItem(
                context,
                icon: Icons.favorite_outline,
                selectedIcon: Icons.favorite,
                label: 'Saved',
                index: 3,
                onTap: () {},
              ),
              _buildNavItem(
                context,
                icon: Icons.person_outline,
                selectedIcon: Icons.person,
                label: 'Profile',
                index: 4,
                onTap: () => context.go('/profile'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(
    BuildContext context, {
    required IconData icon,
    required IconData selectedIcon,
    required String label,
    required int index,
    required VoidCallback onTap,
    int? badge,
  }) {
    final isSelected = currentIndex == index;
    final theme = Theme.of(context);

    return Expanded(
      child: InkWell(
        onTap: onTap,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Icon(
                  isSelected ? selectedIcon : icon,
                  color: isSelected
                      ? Colors.white
                      : Colors.white.withOpacity(0.4),
                  size: 24,
                ),
                if (badge != null && badge > 0)
                  Positioned(
                    right: -8,
                    top: -8,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 18,
                        minHeight: 18,
                      ),
                      child: Text(
                        badge > 9 ? '9+' : '$badge',
                        style: const TextStyle(
                          color: Colors.black,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontSize: 10,
                color: isSelected
                    ? Colors.white
                    : Colors.white.withOpacity(0.4),
              ),
            ),
          ],
        ),
      ),
    );
  }
}


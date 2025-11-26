import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../providers/cart_provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/bottom_nav_bar.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  String _paymentMethod = 'razorpay';
  bool _isProcessing = false;

  @override
  Widget build(BuildContext context) {
    final cartProvider = context.watch<CartProvider>();
    final authProvider = context.watch<AuthProvider>();
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('CHECKOUT'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/cart'),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Order Summary
            Text(
              'ORDER SUMMARY',
              style: theme.textTheme.labelLarge,
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: theme.cardTheme.color,
                border: Border.all(
                  color: Colors.white.withOpacity(0.1),
                ),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Items (${cartProvider.itemCount})',
                        style: theme.textTheme.bodyLarge,
                      ),
                      Text(
                        '₹${cartProvider.totalAmount.toStringAsFixed(0)}',
                        style: theme.textTheme.bodyLarge,
                      ),
                    ],
                  ),
                  const Divider(height: 32),
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
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Payment Method
            Text(
              'PAYMENT METHOD',
              style: theme.textTheme.labelLarge,
            ),
            const SizedBox(height: 16),
            _buildPaymentOption(
              'Razorpay',
              'razorpay',
              Icons.payment,
            ),
            const SizedBox(height: 12),
            _buildPaymentOption(
              'PhonePe',
              'phonepe',
              Icons.phone_android,
            ),
            const SizedBox(height: 32),

            // Place Order Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isProcessing
                    ? null
                    : () async {
                        setState(() => _isProcessing = true);
                        
                        // Simulate payment processing
                        await Future.delayed(const Duration(seconds: 2));
                        
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Order placed successfully!'),
                              backgroundColor: Colors.green,
                            ),
                          );
                          cartProvider.clearCart();
                          context.go('/profile');
                        }
                        
                        setState(() => _isProcessing = false);
                      },
                child: _isProcessing
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          color: Colors.black,
                          strokeWidth: 2,
                        ),
                      )
                    : const Text('PLACE ORDER'),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: const BottomNavBar(currentIndex: 2),
    );
  }

  Widget _buildPaymentOption(String title, String value, IconData icon) {
    final theme = Theme.of(context);
    final isSelected = _paymentMethod == value;

    return GestureDetector(
      onTap: () => setState(() => _paymentMethod = value),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white.withOpacity(0.1) : theme.cardTheme.color,
          border: Border.all(
            color: isSelected ? Colors.white : Colors.white.withOpacity(0.1),
          ),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              color: isSelected ? Colors.white : Colors.white.withOpacity(0.6),
            ),
            const SizedBox(width: 16),
            Text(
              title,
              style: theme.textTheme.bodyLarge?.copyWith(
                color: isSelected ? Colors.white : Colors.white.withOpacity(0.6),
              ),
            ),
            const Spacer(),
            if (isSelected)
              const Icon(
                Icons.check_circle,
                color: Colors.white,
              ),
          ],
        ),
      ),
    );
  }
}


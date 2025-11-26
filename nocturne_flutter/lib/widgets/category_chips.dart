import 'package:flutter/material.dart';

class CategoryChips extends StatelessWidget {
  final List<String> categories;
  final String? selectedCategory;
  final Function(String?) onCategorySelected;

  const CategoryChips({
    super.key,
    required this.categories,
    required this.selectedCategory,
    required this.onCategorySelected,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      height: 50,
      padding: const EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: Colors.white.withOpacity(0.1),
          ),
        ),
      ),
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        children: [
          _buildChip(
            context,
            'ALL',
            selectedCategory == null,
            () => onCategorySelected(null),
          ),
          const SizedBox(width: 8),
          ...categories.map((category) => Padding(
                padding: const EdgeInsets.only(right: 8),
                child: _buildChip(
                  context,
                  category.toUpperCase(),
                  selectedCategory == category,
                  () => onCategorySelected(category),
                ),
              )),
        ],
      ),
    );
  }

  Widget _buildChip(
    BuildContext context,
    String label,
    bool isSelected,
    VoidCallback onTap,
  ) {
    final theme = Theme.of(context);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.transparent,
          border: Border.all(
            color: isSelected ? Colors.white : Colors.white.withOpacity(0.2),
          ),
        ),
        child: Text(
          label,
          style: theme.textTheme.labelLarge?.copyWith(
            fontSize: 10,
            color: isSelected ? Colors.black : Colors.white.withOpacity(0.6),
          ),
        ),
      ),
    );
  }
}


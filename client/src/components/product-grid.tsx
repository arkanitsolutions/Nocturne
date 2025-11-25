import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";
import type { Product } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(0);
  const user = auth.currentUser;
  const queryClient = useQueryClient();

  const { data: cartItems = [] } = useQuery({
    queryKey: ["cart", user?.uid],
    queryFn: () => user ? api.cart.get(user.uid) : Promise.resolve([]),
    enabled: !!user,
  });

  const cartItem = cartItems.find(item => item.productId === product.id);
  const currentQuantity = cartItem?.quantity || 0;

  const addToCartMutation = useMutation({
    mutationFn: ({ productId, qty }: { productId: string; qty: number }) => 
      api.cart.add(user!.uid, productId, qty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.uid] });
      toast.success("Added to cart");
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ id, qty }: { id: string; qty: number }) => 
      api.cart.updateQuantity(id, qty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.uid] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: (id: string) => api.cart.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.uid] });
      toast.success("Removed from cart");
    },
  });

  const handleAdd = () => {
    if (!user) {
      toast.error("Please sign in to add items");
      return;
    }

    if (currentQuantity === 0) {
      addToCartMutation.mutate({ productId: product.id, qty: 1 });
    } else if (cartItem) {
      updateQuantityMutation.mutate({ id: cartItem.id, qty: currentQuantity + 1 });
    }
  };

  const handleSubtract = () => {
    if (!cartItem) return;

    if (currentQuantity === 1) {
      removeFromCartMutation.mutate(cartItem.id);
    } else {
      updateQuantityMutation.mutate({ id: cartItem.id, qty: currentQuantity - 1 });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className="relative bg-black/40 backdrop-blur-sm border border-white/10 overflow-hidden group touch-manipulation"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-black">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-noise mix-blend-overlay opacity-30" />
        
        {/* Quick Add Button - Swiggy Style */}
        {currentQuantity === 0 ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd}
            className="absolute bottom-2 right-2 bg-white text-black px-4 py-2 text-xs font-bold tracking-wider flex items-center gap-2 active:bg-white/90 transition-colors"
            data-testid={`button-add-${product.id}`}
          >
            <Plus className="w-3 h-3" /> ADD
          </motion.button>
        ) : (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="absolute bottom-2 right-2 bg-white text-black flex items-center gap-2 overflow-hidden"
          >
            <button
              onClick={handleSubtract}
              className="px-3 py-2 active:bg-black/10 transition-colors"
              data-testid={`button-subtract-${product.id}`}
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="font-bold text-sm min-w-[20px] text-center" data-testid={`quantity-${product.id}`}>
              {currentQuantity}
            </span>
            <button
              onClick={handleAdd}
              className="px-3 py-2 active:bg-black/10 transition-colors"
              data-testid={`button-add-${product.id}`}
            >
              <Plus className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1">
        <h3 className="font-display text-sm text-white font-medium line-clamp-1" data-testid={`text-name-${product.id}`}>
          {product.name}
        </h3>
        <p className="text-xs text-white/50 line-clamp-1 font-serif italic">
          {product.description}
        </p>
        <div className="flex items-center justify-between pt-1">
          <span className="font-mono text-sm text-white font-semibold" data-testid={`text-price-${product.id}`}>
            ${product.price}
          </span>
          {product.stock < 5 && product.stock > 0 && (
            <span className="text-[10px] text-white/40 uppercase tracking-wider">
              Only {product.stock} left
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 pb-24">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
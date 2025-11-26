import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Trash2, ArrowLeft } from "lucide-react";
import { auth, onAuthChange } from "@/lib/firebase";
import type { User } from "firebase/auth";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Wishlist() {
  const [user, setUser] = useState<User | null>(null);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setLocation("/");
      }
    });
    return () => unsubscribe();
  }, [setLocation]);

  const { data: wishlistItems = [], isLoading } = useQuery({
    queryKey: ["wishlist", user?.uid],
    queryFn: () => user ? api.wishlist.get(user.uid) : Promise.resolve([]),
    enabled: !!user,
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: (id: string) => api.wishlist.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist", user?.uid] });
      toast.success("Removed from wishlist");
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: ({ productId }: { productId: string }) =>
      api.cart.add(user!.uid, productId, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.uid] });
      toast.success("Added to cart");
    },
  });

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-black/40 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <button
              onClick={() => setLocation("/")}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back to Shop</span>
            </button>

            <div>
              <h1 className="font-serif text-2xl font-light tracking-wider">My Wishlist</h1>
              <p className="text-xs text-zinc-500 text-center">{wishlistItems.length} items</p>
            </div>

            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Heart className="w-8 h-8 text-zinc-600" />
            </motion.div>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96">
            <Heart className="w-20 h-20 text-zinc-800 mb-6" />
            <h2 className="text-2xl font-light mb-2">Your wishlist is empty</h2>
            <p className="text-zinc-500 mb-8">Save items you love for later</p>
            <button
              onClick={() => setLocation("/")}
              className="px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-zinc-200 transition-all"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative"
              >
                {/* Product Image */}
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900 mb-4">
                  <img
                    src={item.product?.image}
                    alt={item.product?.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4 space-y-2">
                      <button
                        onClick={() => {
                          addToCartMutation.mutate({ productId: item.productId });
                        }}
                        className="w-full bg-white text-black py-3 rounded-full text-sm font-medium hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Add to Cart
                      </button>
                      <button
                        onClick={() => removeFromWishlistMutation.mutate(item.id)}
                        className="w-full bg-red-500/20 text-red-400 border border-red-500/30 py-3 rounded-full text-sm font-medium hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <p className="text-xs text-zinc-500 tracking-wider uppercase">
                    {item.product?.category}
                  </p>
                  <h3 className="font-light text-base tracking-wide line-clamp-1">
                    {item.product?.name}
                  </h3>
                  <p className="text-lg font-light">
                    ₹{parseFloat(item.product?.price || "0").toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


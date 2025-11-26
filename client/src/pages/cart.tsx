import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { auth } from "@/lib/firebase";
import { MobileNav } from "@/components/mobile-nav";
import { motion } from "framer-motion";
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Cart() {
  const user = auth?.currentUser || null;
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["cart", user?.uid],
    queryFn: () => user ? api.cart.get(user.uid) : Promise.resolve([]),
    enabled: !!user,
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
      toast.success("Item removed");
    },
  });

  const total = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.product?.price || "0");
    return sum + (price * item.quantity);
  }, 0);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setLocation("/checkout");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pb-20">
        <div className="text-center px-4">
          <ShoppingBag className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 mb-4">Please sign in to view your cart</p>
          <button
            onClick={() => setLocation("/")}
            className="bg-white text-black px-6 py-3 text-sm font-bold tracking-wider"
          >
            GO TO SHOP
          </button>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 py-4">
          <h1 className="font-display text-2xl text-white tracking-tight">
            YOUR CART
          </h1>
          <p className="text-xs text-white/40 mt-1">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
          </p>
        </div>
      </header>

      {/* Cart Items */}
      <div className="px-4 py-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <ShoppingBag className="w-8 h-8 text-white/40" />
            </motion.div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <ShoppingBag className="w-16 h-16 text-white/20 mb-4" />
            <p className="text-white/60 mb-4">Your cart is empty</p>
            <button
              onClick={() => setLocation("/")}
              className="bg-white text-black px-6 py-3 text-sm font-bold tracking-wider"
              data-testid="button-shop"
            >
              START SHOPPING
            </button>
          </div>
        ) : (
          cartItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="flex gap-4 bg-white/5 border border-white/10 p-4"
              data-testid={`cart-item-${item.id}`}
            >
              {/* Image */}
              <div className="w-24 h-32 flex-shrink-0 bg-black overflow-hidden">
                <img
                  src={item.product?.image}
                  alt={item.product?.name}
                  className="w-full h-full object-cover opacity-90"
                />
              </div>

              {/* Details */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-sm text-white font-medium" data-testid={`text-name-${item.id}`}>
                    {item.product?.name}
                  </h3>
                  <p className="text-xs text-white/50 mt-1 font-mono" data-testid={`text-price-${item.id}`}>
                    ${item.product?.price}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 bg-white/10 border border-white/20">
                    <button
                      onClick={() => {
                        if (item.quantity === 1) {
                          removeFromCartMutation.mutate(item.id);
                        } else {
                          updateQuantityMutation.mutate({ id: item.id, qty: item.quantity - 1 });
                        }
                      }}
                      className="px-3 py-2 active:bg-white/10"
                      data-testid={`button-decrease-${item.id}`}
                    >
                      {item.quantity === 1 ? (
                        <Trash2 className="w-3 h-3 text-white" />
                      ) : (
                        <Minus className="w-3 h-3 text-white" />
                      )}
                    </button>
                    <span className="font-mono text-sm text-white min-w-[20px] text-center" data-testid={`text-quantity-${item.id}`}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantityMutation.mutate({ id: item.id, qty: item.quantity + 1 })}
                      className="px-3 py-2 active:bg-white/10"
                      data-testid={`button-increase-${item.id}`}
                    >
                      <Plus className="w-3 h-3 text-white" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <span className="font-mono text-sm text-white font-semibold">
                    ${(parseFloat(item.product?.price || "0") * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Checkout Footer */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 p-4 z-30">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Total</span>
              <span className="font-display text-2xl text-white" data-testid="text-total">
                ${total.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-white text-black py-4 text-sm font-bold tracking-wider flex items-center justify-center gap-2 active:bg-white/90"
              data-testid="button-checkout"
            >
              PROCEED TO CHECKOUT <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  );
}
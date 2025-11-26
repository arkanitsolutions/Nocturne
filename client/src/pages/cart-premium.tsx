import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { auth } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, ArrowLeft, Package } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function CartPremium() {
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
      toast.success("Item removed from cart");
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
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4"
        >
          <div className="p-6 bg-white/10 rounded-full mb-6 inline-block">
            <ShoppingBag className="w-12 h-12 text-zinc-600" />
          </div>
          <h2 className="text-2xl font-light mb-2">Sign In Required</h2>
          <p className="text-zinc-500 mb-8">Please sign in to view your cart</p>
          <button
            onClick={() => setLocation("/")}
            className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-zinc-200 transition-all"
          >
            Go to Shop
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-black/40 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <button
              onClick={() => setLocation("/")}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Continue Shopping</span>
            </button>

            <div className="text-center">
              <h1 className="font-serif text-2xl font-light tracking-wider">Shopping Cart</h1>
              <p className="text-xs text-zinc-500 mt-1">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
              </p>
            </div>

            <div className="w-32"></div>
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
              <ShoppingBag className="w-8 h-8 text-zinc-600" />
            </motion.div>
          </div>
        ) : cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-96"
          >
            <div className="p-6 bg-white/10 rounded-full mb-6">
              <ShoppingBag className="w-12 h-12 text-zinc-600" />
            </div>
            <h2 className="text-2xl font-light mb-2">Your cart is empty</h2>
            <p className="text-zinc-500 mb-8">Add some luxury items to get started</p>
            <button
              onClick={() => setLocation("/")}
              className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-zinc-200 transition-all"
            >
              Start Shopping
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                  >
                    <div className="flex gap-6">
                      {/* Image */}
                      <div className="w-32 h-40 flex-shrink-0 bg-zinc-900 rounded-xl overflow-hidden">
                        <img
                          src={item.product?.image}
                          alt={item.product?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-medium text-white text-lg mb-1">
                            {item.product?.name}
                          </h3>
                          <p className="text-sm text-zinc-500 mb-3">
                            {item.product?.category}
                          </p>
                        </div>

                        <div className="flex items-end justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                if (item.quantity === 1) {
                                  removeFromCartMutation.mutate(item.id);
                                } else {
                                  updateQuantityMutation.mutate({ id: item.id, qty: item.quantity - 1 });
                                }
                              }}
                              className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
                            >
                              {item.quantity === 1 ? (
                                <Trash2 className="w-4 h-4 text-red-400" />
                              ) : (
                                <Minus className="w-4 h-4 text-white" />
                              )}
                            </button>
                            
                            <span className="font-medium text-white min-w-[30px] text-center">
                              {item.quantity}
                            </span>
                            
                            <button
                              onClick={() => updateQuantityMutation.mutate({ id: item.id, qty: item.quantity + 1 })}
                              className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
                            >
                              <Plus className="w-4 h-4 text-white" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="text-xs text-zinc-600 mb-1">Subtotal</p>
                            <p className="text-xl font-light text-white">
                              ₹{(parseFloat(item.product?.price || "0") * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                <h3 className="text-xl font-light tracking-wide">Order Summary</h3>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Subtotal</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Shipping</span>
                    <span className="text-green-400">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Tax</span>
                    <span>₹0</span>
                  </div>
                  <div className="border-t border-white/10 pt-3">
                    <div className="flex justify-between text-lg font-light">
                      <span>Total</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-white text-black py-4 rounded-full font-medium hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Package className="w-4 h-4" />
                  <span>Free shipping on all orders</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



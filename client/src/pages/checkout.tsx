import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { auth } from "@/lib/firebase";
import { MobileNav } from "@/components/mobile-nav";
import { motion } from "framer-motion";
import { CreditCard, Smartphone, Check } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Checkout() {
  const user = auth.currentUser;
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "phonepe">("razorpay");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: cartItems = [] } = useQuery({
    queryKey: ["cart", user?.uid],
    queryFn: () => user ? api.cart.get(user.uid) : Promise.resolve([]),
    enabled: !!user,
  });

  const total = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.product?.price || "0");
    return sum + (price * item.quantity);
  }, 0);

  const createOrderMutation = useMutation({
    mutationFn: (data: { order: any; items: any[] }) => api.orders.create(data.order, data.items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.uid] });
      queryClient.invalidateQueries({ queryKey: ["orders", user?.uid] });
      toast.success("Order placed successfully!");
      setLocation("/profile");
    },
    onError: () => {
      toast.error("Failed to place order");
      setIsProcessing(false);
    },
  });

  const handlePayment = async () => {
    if (!user || cartItems.length === 0) return;

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      const orderData = {
        userId: user.uid,
        total: total.toFixed(2),
        paymentMethod,
        status: "pending",
        paymentId: `${paymentMethod}_${Date.now()}`,
      };

      const orderItems = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product?.price || "0",
      }));

      createOrderMutation.mutate({ order: orderData, items: orderItems });
    }, 2000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pb-20">
        <div className="text-center px-4">
          <p className="text-white/60 mb-4">Please sign in to checkout</p>
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
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 py-4">
          <h1 className="font-display text-2xl text-white tracking-tight">CHECKOUT</h1>
          <p className="text-xs text-white/40 mt-1">Select payment method</p>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Order Summary */}
        <div className="bg-white/5 border border-white/10 p-4 space-y-3">
          <h2 className="font-display text-sm text-white/60 tracking-wider">ORDER SUMMARY</h2>
          {cartItems.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-white/80">
                {item.product?.name} x{item.quantity}
              </span>
              <span className="text-white font-mono">
                ${(parseFloat(item.product?.price || "0") * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="h-px bg-white/10 my-3" />
          <div className="flex justify-between items-center">
            <span className="font-display text-white">TOTAL</span>
            <span className="font-display text-2xl text-white" data-testid="text-total">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-3">
          <h2 className="font-display text-sm text-white/60 tracking-wider">PAYMENT METHOD</h2>
          
          {/* Razorpay - Cards */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setPaymentMethod("razorpay")}
            className={`w-full p-4 border transition-all ${
              paymentMethod === "razorpay"
                ? "bg-white/10 border-white"
                : "bg-white/5 border-white/10"
            }`}
            data-testid="button-razorpay"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">Credit / Debit Card</p>
                  <p className="text-xs text-white/40">Powered by Razorpay</p>
                </div>
              </div>
              {paymentMethod === "razorpay" && (
                <Check className="w-5 h-5 text-white" />
              )}
            </div>
          </motion.button>

          {/* PhonePe - UPI */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setPaymentMethod("phonepe")}
            className={`w-full p-4 border transition-all ${
              paymentMethod === "phonepe"
                ? "bg-white/10 border-white"
                : "bg-white/5 border-white/10"
            }`}
            data-testid="button-phonepe"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">UPI Payment</p>
                  <p className="text-xs text-white/40">PhonePe, Google Pay, Paytm</p>
                </div>
              </div>
              {paymentMethod === "phonepe" && (
                <Check className="w-5 h-5 text-white" />
              )}
            </div>
          </motion.button>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={isProcessing || cartItems.length === 0}
          className="w-full bg-white text-black py-4 text-sm font-bold tracking-wider disabled:opacity-50 disabled:cursor-not-allowed active:bg-white/90 mt-8"
          data-testid="button-pay"
        >
          {isProcessing ? "PROCESSING..." : `PAY $${total.toFixed(2)}`}
        </button>

        <p className="text-xs text-white/30 text-center leading-relaxed">
          By placing this order, you agree to NOCTURNE's terms of service and privacy policy.
          This is a demo checkout - no real payment will be processed.
        </p>
      </div>

      <MobileNav />
    </div>
  );
}
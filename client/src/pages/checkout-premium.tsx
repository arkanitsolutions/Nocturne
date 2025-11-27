import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Wallet, CheckCircle, Tag, X, Ticket } from "lucide-react";
import { auth, onAuthChange } from "@/lib/firebase";
import type { User } from "firebase/auth";
import { useLocation } from "wouter";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPremium() {
  const [user, setUser] = useState<User | null>(null);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "phonepe">("razorpay");
  const [isProcessing, setIsProcessing] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; discountType: string } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setLocation("/");
      }
    });
    return () => unsubscribe();
  }, [setLocation]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["cart", user?.uid],
    queryFn: () => user ? api.cart.get(user.uid) : Promise.resolve([]),
    enabled: !!user,
  });

  const subtotal = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.product?.price || "0");
    return sum + price * item.quantity;
  }, 0);

  const discount = appliedCoupon?.discount || 0;
  const total = Math.max(0, subtotal - discount);

  // Validate coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsValidatingCoupon(true);
    setCouponError("");

    try {
      const result = await api.coupons.validate(couponCode.trim(), subtotal);

      if (result.valid && result.coupon && result.discount !== undefined) {
        setAppliedCoupon({
          code: result.coupon.code,
          discount: result.discount,
          discountType: result.coupon.discountType,
        });
        setCouponCode("");
        toast.success(`Coupon applied! You save ₹${result.discount.toLocaleString()}`);
      } else {
        setCouponError(result.error || "Invalid coupon");
      }
    } catch (error) {
      setCouponError("Failed to validate coupon");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
    toast.info("Coupon removed");
  };

  const createOrderMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const order = await api.orders.create(
        {
          userId: user!.uid,
          userEmail: user!.email || undefined,
          userName: user!.displayName || undefined,
          subtotal: subtotal.toString(),
          discount: discount.toString(),
          couponCode: appliedCoupon?.code || undefined,
          total: total.toString(),
          status: "pending",
          paymentMethod,
          paymentId,
        },
        cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product?.price || "0",
          size: item.size || undefined,
        }))
      );

      // Clear cart
      for (const item of cartItems) {
        await api.cart.remove(item.id);
      }

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.uid] });
      queryClient.invalidateQueries({ queryKey: ["orders", user?.uid] });
      toast.success("Order placed successfully!");
      setLocation("/profile");
    },
  });

  const handleRazorpayPayment = async () => {
    if (!user) return;

    setIsProcessing(true);

    try {
      // Create Razorpay order
      const orderData = await api.payment.createOrder(total);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_demo_key",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "NocturneLux",
        description: "Luxury Fashion Purchase",
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResult = await api.payment.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResult.success) {
              // Create order in database
              await createOrderMutation.mutateAsync(response.razorpay_payment_id);
            } else {
              toast.error("Payment verification failed");
              setIsProcessing(false);
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed");
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user.displayName || "",
          email: user.email || "",
        },
        theme: {
          color: "#000000",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to initiate payment");
      setIsProcessing(false);
    }
  };

  const handlePhonePePayment = async () => {
    // For demo purposes, create order with mock payment ID
    toast.info("PhonePe integration coming soon! Using demo payment...");
    await createOrderMutation.mutateAsync(`phonepe_${Date.now()}`);
  };

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
              onClick={() => setLocation("/cart")}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back to Cart</span>
            </button>

            <h1 className="font-serif text-2xl font-light tracking-wider">Checkout</h1>

            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <CreditCard className="w-8 h-8 text-zinc-600" />
            </motion.div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-light mb-2">Your cart is empty</h2>
            <p className="text-zinc-500 mb-8">Add some items to checkout</p>
            <button
              onClick={() => setLocation("/")}
              className="px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-zinc-200 transition-all"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-light tracking-wide mb-6">Order Summary</h2>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl"
                    >
                      <img
                        src={item.product?.image}
                        alt={item.product?.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{item.product?.name}</h3>
                        <p className="text-sm text-zinc-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-light">
                          ₹{(parseFloat(item.product?.price || "0") * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="text-2xl font-light tracking-wide mb-6">Payment Method</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => setPaymentMethod("razorpay")}
                    className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                      paymentMethod === "razorpay"
                        ? "bg-white/10 border-white"
                        : "bg-white/5 border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <CreditCard className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-medium mb-1">Razorpay</h3>
                      <p className="text-sm text-zinc-500">
                        Credit/Debit Card, UPI, Net Banking, Wallets
                      </p>
                    </div>
                    {paymentMethod === "razorpay" && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                  </button>

                  <button
                    onClick={() => setPaymentMethod("phonepe")}
                    className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                      paymentMethod === "phonepe"
                        ? "bg-white/10 border-white"
                        : "bg-white/5 border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <Wallet className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-medium mb-1">PhonePe</h3>
                      <p className="text-sm text-zinc-500">Pay using PhonePe UPI</p>
                    </div>
                    {paymentMethod === "phonepe" && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                <h3 className="text-xl font-light tracking-wide">Payment Summary</h3>

                {/* Coupon Code Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Ticket className="w-4 h-4" />
                    <span>Have a promo code?</span>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-medium">{appliedCoupon.code}</span>
                        <span className="text-green-400/70 text-sm">
                          (-₹{appliedCoupon.discount.toLocaleString()})
                        </span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="p-1 hover:bg-white/10 rounded-full transition-all"
                      >
                        <X className="w-4 h-4 text-zinc-400 hover:text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Enter coupon code"
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30 placeholder:text-zinc-600 uppercase"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={isValidatingCoupon || !couponCode.trim()}
                          className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm font-medium hover:bg-white/20 transition-all disabled:opacity-50"
                        >
                          {isValidatingCoupon ? "..." : "Apply"}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-sm text-red-400">{couponError}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-3 border-t border-white/10 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">Discount ({appliedCoupon.code})</span>
                      <span className="text-green-400">-₹{appliedCoupon.discount.toLocaleString()}</span>
                    </div>
                  )}
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
                  onClick={paymentMethod === "razorpay" ? handleRazorpayPayment : handlePhonePePayment}
                  disabled={isProcessing}
                  className="w-full bg-white text-black py-4 rounded-full font-medium hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <CreditCard className="w-5 h-5" />
                      </motion.div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay ₹{total.toLocaleString()}
                    </>
                  )}
                </button>

                <p className="text-xs text-zinc-500 text-center">
                  Your payment information is secure and encrypted
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



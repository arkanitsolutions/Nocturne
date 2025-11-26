import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Truck, User, LogOut } from "lucide-react";
import { auth, signOut, onAuthChange } from "@/lib/firebase";
import type { User as FirebaseUser } from "firebase/auth";
import { useLocation } from "wouter";

export default function ProfilePremium() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setLocation("/");
      }
    });
    return () => unsubscribe();
  }, [setLocation]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders", user?.uid],
    queryFn: () => user ? api.orders.get(user.uid) : Promise.resolve([]),
    enabled: !!user,
  });

  const handleSignOut = async () => {
    await signOut();
    setLocation("/");
  };

  if (!user) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "processing":
        return <Package className="w-5 h-5 text-blue-500" />;
      case "shipped":
        return <Truck className="w-5 h-5 text-purple-500" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-zinc-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "processing":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "shipped":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
    }
  };

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

            <h1 className="font-serif text-2xl font-light tracking-wider">My Account</h1>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm hover:bg-white/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
              {/* User Info */}
              <div className="text-center">
                <img
                  src={user.photoURL || ""}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-white/20 mx-auto mb-4"
                />
                <h2 className="text-xl font-light mb-1">{user.displayName}</h2>
                <p className="text-sm text-zinc-500">{user.email}</p>
              </div>

              {/* Navigation */}
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex items-center gap-3 ${
                    activeTab === "orders"
                      ? "bg-white text-black"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <Package className="w-5 h-5" />
                  My Orders
                </button>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all flex items-center gap-3 ${
                    activeTab === "profile"
                      ? "bg-white text-black"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <User className="w-5 h-5" />
                  Profile Settings
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "orders" ? (
              <div>
                <h2 className="text-2xl font-light tracking-wide mb-6">Order History</h2>

                {isLoading ? (
                  <div className="flex items-center justify-center h-96">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Package className="w-8 h-8 text-zinc-600" />
                    </motion.div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-96 bg-white/5 border border-white/10 rounded-2xl">
                    <Package className="w-16 h-16 text-zinc-800 mb-4" />
                    <h3 className="text-xl font-light mb-2">No orders yet</h3>
                    <p className="text-zinc-500 mb-6">Start shopping to see your orders here</p>
                    <button
                      onClick={() => setLocation("/")}
                      className="px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-zinc-200 transition-all"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/5 rounded-xl">
                              {getStatusIcon(order.status)}
                            </div>
                            <div>
                              <h3 className="font-medium mb-1">Order #{order.id.slice(0, 8)}</h3>
                              <p className="text-sm text-zinc-500">
                                {new Date(order.createdAt!).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-xl font-light mb-2">
                              ₹{parseFloat(order.total).toLocaleString()}
                            </p>
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        </div>

                        {/* Order Timeline */}
                        <div className="mt-6 pt-6 border-t border-white/10">
                          <div className="flex items-center justify-between">
                            {["pending", "processing", "shipped", "completed"].map((step, i) => (
                              <div key={step} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                                      getStatusIndex(order.status) >= i
                                        ? "bg-white border-white text-black"
                                        : "bg-transparent border-zinc-700 text-zinc-700"
                                    }`}
                                  >
                                    {getStatusIndex(order.status) > i ? (
                                      <CheckCircle className="w-5 h-5" />
                                    ) : (
                                      <div className="w-2 h-2 rounded-full bg-current" />
                                    )}
                                  </div>
                                  <p
                                    className={`text-xs mt-2 ${
                                      getStatusIndex(order.status) >= i
                                        ? "text-white"
                                        : "text-zinc-600"
                                    }`}
                                  >
                                    {step.charAt(0).toUpperCase() + step.slice(1)}
                                  </p>
                                </div>
                                {i < 3 && (
                                  <div
                                    className={`h-0.5 flex-1 -mt-8 ${
                                      getStatusIndex(order.status) > i
                                        ? "bg-white"
                                        : "bg-zinc-800"
                                    }`}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Payment Info */}
                        <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-zinc-400">
                            <span>Payment Method:</span>
                            <span className="text-white font-medium">
                              {order.paymentMethod.charAt(0).toUpperCase() +
                                order.paymentMethod.slice(1)}
                            </span>
                          </div>
                          {order.paymentId && (
                            <div className="flex items-center gap-2 text-zinc-400">
                              <span>Payment ID:</span>
                              <span className="text-white font-mono text-xs">
                                {order.paymentId}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-light tracking-wide mb-6">Profile Settings</h2>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm text-zinc-400 mb-2 block">Full Name</label>
                      <input
                        type="text"
                        value={user.displayName || ""}
                        disabled
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-zinc-400 mb-2 block">Email</label>
                      <input
                        type="email"
                        value={user.email || ""}
                        disabled
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none"
                      />
                    </div>
                    <p className="text-sm text-zinc-500">
                      Profile information is managed through your Google account.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusIndex(status: string): number {
  const statuses = ["pending", "processing", "shipped", "completed"];
  return statuses.indexOf(status);
}



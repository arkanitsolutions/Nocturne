import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { auth, signOut, onAuthChange } from "@/lib/firebase";
import { MobileNav } from "@/components/mobile-nav";
import { motion } from "framer-motion";
import { LogOut, Package, User as UserIcon } from "lucide-react";
import { useLocation } from "wouter";
import type { User } from "firebase/auth";

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const { data: orders = [] } = useQuery({
    queryKey: ["orders", user?.uid],
    queryFn: () => user ? api.orders.get(user.uid) : Promise.resolve([]),
    enabled: !!user,
  });

  const handleSignOut = async () => {
    await signOut();
    setLocation("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pb-20">
        <div className="text-center px-4">
          <UserIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 mb-4">Please sign in to view your profile</p>
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
      <header className="bg-black/95 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={user.photoURL || ""}
              alt="Profile"
              className="w-16 h-16 rounded-full border border-white/20"
              data-testid="img-profile"
            />
            <div>
              <h1 className="font-display text-xl text-white" data-testid="text-username">
                {user.displayName}
              </h1>
              <p className="text-xs text-white/40 mt-1">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
            data-testid="button-signout"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Orders */}
      <div className="px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-white/40" />
          <h2 className="font-display text-lg text-white">YOUR ORDERS</h2>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Package className="w-16 h-16 text-white/20 mb-4" />
            <p className="text-white/60 mb-4">No orders yet</p>
            <button
              onClick={() => setLocation("/")}
              className="bg-white text-black px-6 py-3 text-sm font-bold tracking-wider"
            >
              START SHOPPING
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 border border-white/10 p-4"
                data-testid={`order-${order.id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-white/40 font-mono">
                      ORDER #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      {new Date(order.createdAt!).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-3 py-1 text-[10px] font-bold tracking-wider ${
                    order.status === "completed" 
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : order.status === "processing"
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : "bg-white/10 text-white/60 border border-white/20"
                  }`}>
                    {order.status.toUpperCase()}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/60">
                    Paid via {order.paymentMethod === "razorpay" ? "Card" : "UPI"}
                  </p>
                  <p className="font-mono text-lg text-white font-semibold" data-testid={`text-total-${order.id}`}>
                    ${order.total}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}
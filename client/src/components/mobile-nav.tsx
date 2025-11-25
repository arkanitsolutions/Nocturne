import { Link, useLocation } from "wouter";
import { Home, Search, ShoppingBag, User, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { auth } from "@/lib/firebase";

export function MobileNav() {
  const [location] = useLocation();
  const user = auth.currentUser;
  
  const { data: cartItems = [] } = useQuery({
    queryKey: ["cart", user?.uid],
    queryFn: () => user ? api.cart.get(user.uid) : Promise.resolve([]),
    enabled: !!user,
  });

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { icon: Home, label: "Shop", path: "/" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: ShoppingBag, label: "Cart", path: "/cart", badge: cartCount },
    { icon: Heart, label: "Saved", path: "/saved" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-white/10 safe-area-pb">
      <nav className="flex items-center justify-around px-2 py-3 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link key={item.label} href={item.path}>
              <a className="flex flex-col items-center gap-1 relative px-4 py-2 -mb-1 touch-manipulation">
                <div className="relative">
                  <item.icon 
                    className={cn(
                      "w-5 h-5 transition-all duration-300", 
                      isActive 
                        ? "text-white scale-110" 
                        : "text-white/40"
                    )} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {item.badge && item.badge > 0 && (
                    <div className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {item.badge > 9 ? "9+" : item.badge}
                    </div>
                  )}
                </div>
                <span 
                  className={cn(
                    "text-[10px] font-medium transition-colors duration-300",
                    isActive ? "text-white" : "text-white/40"
                  )}
                >
                  {item.label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="mobile-nav-indicator"
                    className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-[2px] bg-white"
                  />
                )}
              </a>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
import { Link, useLocation } from "wouter";
import { Home, Search, ShoppingBag, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function NavBar() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: ShoppingBag, label: "Cart", path: "/cart" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-6 flex justify-center pointer-events-none">
      <motion.nav 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
        className="bg-background/80 backdrop-blur-md border border-white/10 px-8 py-4 rounded-full flex gap-12 pointer-events-auto shadow-[0_0_30px_-10px_rgba(255,255,255,0.1)]"
      >
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link key={item.label} href={item.path}>
              <div className="relative group cursor-pointer">
                <item.icon 
                  className={cn(
                    "w-5 h-5 transition-all duration-500", 
                    isActive ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "text-white/40 group-hover:text-white/80"
                  )} 
                />
                {isActive && (
                  <motion.div 
                    layoutId="nav-indicator"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_5px_white]"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </motion.nav>
    </div>
  );
}
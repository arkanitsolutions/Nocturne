import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { MobileNav } from "@/components/mobile-nav";
import { ProductGrid } from "@/components/product-grid";
import { CategoryChips } from "@/components/category-chips";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { auth, signInWithGoogle, signOut, onAuthChange } from "@/lib/firebase";
import type { User } from "firebase/auth";

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: api.products.getAll,
  });

  const categories = Array.from(new Set(allProducts.map(p => p.category)));
  
  const displayProducts = selectedCategory
    ? allProducts.filter(p => p.category === selectedCategory)
    : allProducts;

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="font-gothic text-3xl text-white tracking-tight leading-none">
              NOCTURNE
            </h1>
            <p className="text-[10px] text-white/40 tracking-[0.3em] font-sans mt-1">
              LUXURY DARKNESS
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <img 
                  src={user.photoURL || ""} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full border border-white/20"
                />
                <button
                  onClick={() => signOut()}
                  className="text-xs text-white/60 tracking-wider"
                  data-testid="button-signout"
                >
                  SIGN OUT
                </button>
              </div>
            ) : (
              <button
                onClick={() => signInWithGoogle()}
                className="bg-white text-black px-4 py-2 text-xs font-bold tracking-wider active:bg-white/90"
                data-testid="button-signin"
              >
                SIGN IN
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Categories */}
      {categories.length > 0 && (
        <CategoryChips
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      )}

      {/* Products */}
      <div className="pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <ShoppingBag className="w-8 h-8 text-white/40" />
            </motion.div>
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 px-4 text-center">
            <ShoppingBag className="w-12 h-12 text-white/20 mb-4" />
            <p className="text-white/40 text-sm">No products found</p>
          </div>
        ) : (
          <ProductGrid products={displayProducts} />
        )}
      </div>

      <MobileNav />
    </div>
  );
}
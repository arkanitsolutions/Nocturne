import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ShoppingBag, User, X, Star, SlidersHorizontal } from "lucide-react";
import { signOut, onAuthChange } from "@/lib/firebase";
import { AuthModal } from "@/components/auth-modal";
import type { User as FirebaseUser } from "firebase/auth";
import type { Product } from "@shared/schema";
import { useLocation } from "wouter";

export default function ShopPremium() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high" | "popular">("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [, setLocation] = useLocation();

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

  const { data: wishlistItems = [] } = useQuery({
    queryKey: ["wishlist", user?.uid],
    queryFn: () => user ? api.wishlist.get(user.uid) : Promise.resolve([]),
    enabled: !!user,
  });

  const { data: cartItems = [] } = useQuery({
    queryKey: ["cart", user?.uid],
    queryFn: () => user ? api.cart.get(user.uid) : Promise.resolve([]),
    enabled: !!user,
  });

  const categories = Array.from(new Set(allProducts.map(p => p.category)));

  // Filter and sort products
  let displayProducts = allProducts;

  if (searchQuery) {
    displayProducts = displayProducts.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (selectedCategory) {
    displayProducts = displayProducts.filter(p => p.category === selectedCategory);
  }

  displayProducts = displayProducts.filter(p => {
    const price = parseFloat(p.price);
    return price >= priceRange[0] && price <= priceRange[1];
  });

  // Sort
  displayProducts = [...displayProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price-high":
        return parseFloat(b.price) - parseFloat(a.price);
      case "newest":
        return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
      default:
        return 0;
    }
  });

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-black/40 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="cursor-pointer"
              onClick={() => setLocation("/")}
            >
              <h1 className="font-serif text-3xl font-light tracking-wider bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
                NOCTURNE
              </h1>
              <p className="text-[9px] tracking-[0.4em] text-zinc-500 font-light mt-0.5">
                LUXURY REDEFINED
              </p>
            </motion.div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                <input
                  type="text"
                  placeholder="Search luxury items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-zinc-600"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>

              <button
                onClick={() => user && setLocation("/wishlist")}
                className="relative p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10"
              >
                <Heart className="w-5 h-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                    {wishlistItems.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setLocation("/cart")}
                className="relative p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                    {cartItems.length}
                  </span>
                )}
              </button>

              {user ? (
                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                  <div
                    className="w-9 h-9 rounded-full border-2 border-white/20 cursor-pointer hover:border-white/40 transition-all overflow-hidden bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center"
                    onClick={() => setLocation("/profile")}
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-medium text-sm">
                        {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-6 py-2.5 bg-white text-black rounded-full text-sm font-medium hover:bg-zinc-200 transition-all"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Filters Sidebar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setShowFilters(false)}
          >
            <motion.div
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 h-full w-80 bg-zinc-900 border-l border-white/10 p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-light tracking-wider">FILTERS</h3>
                <button onClick={() => setShowFilters(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sort */}
              <div className="mb-8">
                <label className="text-xs text-zinc-500 tracking-wider mb-3 block">SORT BY</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-white/30"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <label className="text-xs text-zinc-500 tracking-wider mb-3 block">
                  PRICE RANGE: ₹{priceRange[0]} - ₹{priceRange[1]}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  className="w-full"
                />
              </div>

              {/* Categories */}
              <div>
                <label className="text-xs text-zinc-500 tracking-wider mb-3 block">CATEGORY</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                      !selectedCategory
                        ? "bg-white text-black"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    All Products
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                        selectedCategory === category
                          ? "bg-white text-black"
                          : "bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-zinc-500">
              Showing <span className="text-white font-medium">{displayProducts.length}</span> of{" "}
              <span className="text-white font-medium">{allProducts.length}</span> products
            </p>
          </div>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-sm text-zinc-400 hover:text-white flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear filters
            </button>
          )}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <ShoppingBag className="w-8 h-8 text-zinc-600" />
            </motion.div>
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96">
            <Search className="w-16 h-16 text-zinc-800 mb-4" />
            <p className="text-zinc-500 text-lg">No products found</p>
            <p className="text-zinc-600 text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                isInWishlist={isInWishlist(product.id)}
                user={user}
              />
            ))}
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}

// Premium Product Card Component
function ProductCard({
  product,
  index,
  isInWishlist,
  user,
}: {
  product: Product;
  index: number;
  isInWishlist: boolean;
  user: FirebaseUser | null;
}) {
  const [, setLocation] = useLocation();
  const [showQuickView, setShowQuickView] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative cursor-pointer"
      onClick={() => setLocation(`/product/${product.id}`)}
    >
      {/* Product Image */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900 mb-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={() => setLocation(`/product/${product.id}`)}
              className="w-full bg-white text-black py-3 rounded-full text-sm font-medium hover:bg-zinc-200 transition-all"
            >
              Quick View
            </button>
          </div>
        </div>

        {/* Wishlist Button */}
        {user && (
          <button className="absolute top-4 right-4 p-2.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 hover:bg-black/60 transition-all">
            <Heart
              className={`w-5 h-5 ${isInWishlist ? "fill-red-500 text-red-500" : "text-white"}`}
            />
          </button>
        )}

        {/* Stock Badge */}
        {product.stock === 0 && (
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-red-500/90 backdrop-blur-sm text-white text-xs font-medium">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-2">
        <p className="text-xs text-zinc-500 tracking-wider uppercase">{product.category}</p>
        <h3 className="font-light text-base tracking-wide line-clamp-1">{product.name}</h3>
        <div className="flex items-center justify-between">
          <p className="text-lg font-light">₹{parseFloat(product.price).toLocaleString()}</p>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            <span className="text-sm text-zinc-400">4.5</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}



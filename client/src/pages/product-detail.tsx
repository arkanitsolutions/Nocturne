import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, ShoppingBag, Star, User } from "lucide-react";
import { auth, onAuthChange } from "@/lib/firebase";
import type { User as FirebaseUser } from "firebase/auth";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";

export default function ProductDetail() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/product/:id");
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const productId = params?.id || "";

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => api.products.getById(productId),
    enabled: !!productId,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => api.reviews.get(productId),
    enabled: !!productId,
  });

  const { data: productRating } = useQuery({
    queryKey: ["rating", productId],
    queryFn: () => api.reviews.getRating(productId),
    enabled: !!productId,
  });

  const { data: isInWishlist = false } = useQuery({
    queryKey: ["wishlist-check", user?.uid, productId],
    queryFn: () => user ? api.wishlist.check(user.uid, productId) : Promise.resolve(false),
    enabled: !!user && !!productId,
  });

  const addToCartMutation = useMutation({
    mutationFn: () => api.cart.add(user!.uid, productId, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", user?.uid] });
      toast.success("Added to cart!");
    },
  });

  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      if (isInWishlist) {
        const wishlistItems = await api.wishlist.get(user!.uid);
        const item = wishlistItems.find(i => i.productId === productId);
        if (item) {
          await api.wishlist.remove(item.id);
        }
      } else {
        await api.wishlist.add(user!.uid, productId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist-check", user?.uid, productId] });
      queryClient.invalidateQueries({ queryKey: ["wishlist", user?.uid] });
      toast.success(isInWishlist ? "Removed from wishlist" : "Added to wishlist!");
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: () =>
      api.reviews.create({
        productId,
        userId: user!.uid,
        userName: user!.displayName || "Anonymous",
        userPhoto: user!.photoURL || undefined,
        rating,
        comment,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["rating", productId] });
      setComment("");
      setRating(5);
      setShowReviewForm(false);
      toast.success("Review posted!");
    },
  });

  if (isLoading || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <ShoppingBag className="w-8 h-8 text-zinc-600" />
        </motion.div>
      </div>
    );
  }

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

            <h1 className="font-serif text-2xl font-light tracking-wider">Product Details</h1>

            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-zinc-900"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Category & Rating */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500 tracking-wider uppercase">
                {product.category}
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(productRating?.average || 0)
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-zinc-700"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-zinc-400">
                  {productRating?.average || 0} ({productRating?.count || 0} reviews)
                </span>
              </div>
            </div>

            {/* Title & Price */}
            <div>
              <h1 className="text-4xl font-light tracking-wide mb-4">{product.name}</h1>
              <p className="text-3xl font-light">₹{parseFloat(product.price).toLocaleString()}</p>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm text-zinc-500 tracking-wider uppercase mb-3">Description</h3>
              <p className="text-zinc-300 leading-relaxed">{product.description}</p>
            </div>

            {/* Stock Status */}
            <div>
              <h3 className="text-sm text-zinc-500 tracking-wider uppercase mb-3">Availability</h3>
              <p className={`text-sm ${product.stock > 0 ? "text-green-400" : "text-red-400"}`}>
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => user && addToCartMutation.mutate()}
                disabled={!user || product.stock === 0}
                className="flex-1 bg-white text-black py-4 rounded-full font-medium hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                {!user ? "Sign in to purchase" : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>

              {user && (
                <button
                  onClick={() => toggleWishlistMutation.mutate()}
                  className="p-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <Heart
                    className={`w-6 h-6 ${
                      isInWishlist ? "fill-red-500 text-red-500" : "text-white"
                    }`}
                  />
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-light tracking-wide">Customer Reviews</h2>
            {user && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-sm hover:bg-white/10 transition-all"
              >
                Write a Review
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && user && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-8 p-6 bg-white/5 border border-white/10 rounded-2xl"
            >
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= rating ? "fill-yellow-500 text-yellow-500" : "text-zinc-700"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Your Review</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts about this product..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30 resize-none h-32"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => createReviewMutation.mutate()}
                    disabled={!comment.trim()}
                    className="px-6 py-2.5 bg-white text-black rounded-full text-sm font-medium hover:bg-zinc-200 transition-all disabled:opacity-50"
                  >
                    Post Review
                  </button>
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-sm hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-white/5 border border-white/10 rounded-2xl"
                >
                  <div className="flex items-start gap-4">
                    {review.userPhoto ? (
                      <img
                        src={review.userPhoto}
                        alt={review.userName}
                        className="w-12 h-12 rounded-full border-2 border-white/20"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                        <User className="w-6 h-6 text-zinc-500" />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{review.userName}</h4>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "fill-yellow-500 text-yellow-500"
                                  : "text-zinc-700"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-zinc-300 text-sm leading-relaxed">{review.comment}</p>
                      <p className="text-xs text-zinc-600 mt-2">
                        {new Date(review.createdAt!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


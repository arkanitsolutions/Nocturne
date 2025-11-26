import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  LogOut,
  Store,
  TrendingUp,
  AlertCircle,
  X,
  Upload,
  Image as ImageIcon,
  DollarSign,
  Tag,
  FileText,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  stock: number;
}

// Product Card Component (Premium Grid View)
function ProductCard({ product, onEdit }: { product: Product; onEdit: (p: Product) => void }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted successfully');
    },
  });

  const handleDelete = () => {
    if (confirm(`Delete "${product.name}"?`)) {
      deleteMutation.mutate(product.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all"
    >
      {/* Product Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />

        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-xl ${
            product.stock > 0
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4 flex gap-2">
            <button
              onClick={() => onEdit(product)}
              className="flex-1 bg-white text-black py-2 px-4 rounded-full font-medium hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-white line-clamp-1">{product.name}</h3>
        </div>

        <p className="text-sm text-zinc-500 mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-600 mb-1">Price</p>
            <p className="text-lg font-light text-white">₹{parseFloat(product.price).toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-600 mb-1">Category</p>
            <p className="text-sm text-zinc-400">{product.category}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Premium Product Modal Component
function ProductModal({
  product,
  onClose,
  onSuccess
}: {
  product?: Product;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    image: product?.image || '',
    category: product?.category || 'Corsets',
    stock: product?.stock || 10,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const token = localStorage.getItem('adminToken');
      const url = product ? `/api/products/${product.id}` : '/api/products';
      const method = product ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to save product');
      return response.json();
    },
    onSuccess: () => {
      toast.success(product ? 'Product updated successfully!' : 'Product created successfully!');
      onSuccess();
    },
    onError: () => {
      toast.error('Failed to save product');
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const token = localStorage.getItem('adminToken');

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataUpload,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      if (result.success && result.url) {
        setFormData(prev => ({ ...prev, image: result.url }));
        toast.success('Image uploaded successfully!');
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-zinc-900 via-black to-zinc-900 border border-white/10 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl">
                {product ? <Edit2 className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
              </div>
              <h3 className="font-serif text-2xl font-light text-white tracking-wide">
                {product ? 'Edit Product' : 'Add New Product'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-all"
            >
              <X className="w-5 h-5 text-zinc-400 hover:text-white" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Image Preview */}
            {formData.image && (
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-white/10">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <div className="px-3 py-1 bg-black/50 backdrop-blur-xl rounded-full text-xs text-white border border-white/20">
                    Preview
                  </div>
                </div>
              </div>
            )}

            {/* Product Name */}
            <div>
              <label className="flex items-center gap-2 text-white/80 text-sm font-medium mb-3">
                <FileText className="w-4 h-4" />
                Product Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-zinc-600"
                placeholder="Enter product name..."
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-white/80 text-sm font-medium mb-3">
                <FileText className="w-4 h-4" />
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl h-32 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all resize-none placeholder:text-zinc-600"
                placeholder="Enter product description..."
                required
              />
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-white/80 text-sm font-medium mb-3">
                  <DollarSign className="w-4 h-4" />
                  Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-zinc-600"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-white/80 text-sm font-medium mb-3">
                  <Package className="w-4 h-4" />
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-zinc-600"
                  placeholder="0"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="flex items-center gap-2 text-white/80 text-sm font-medium mb-3">
                <Tag className="w-4 h-4" />
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
              >
                <option value="Corsets">Corsets</option>
                <option value="Dresses">Dresses</option>
                <option value="Jewelry">Jewelry</option>
                <option value="Outerwear">Outerwear</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            {/* Image Upload */}
            <div>
              <label className="flex items-center gap-2 text-white/80 text-sm font-medium mb-3">
                <ImageIcon className="w-4 h-4" />
                Product Image
              </label>

              {/* Upload Button */}
              <div className="space-y-3">
                <label className={`
                  flex items-center justify-center gap-3 w-full py-4 px-6
                  border-2 border-dashed border-white/20 rounded-xl
                  cursor-pointer transition-all
                  ${isUploading ? 'bg-white/5 cursor-not-allowed' : 'hover:border-white/40 hover:bg-white/5'}
                `}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                  {isUploading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Upload className="w-5 h-5 text-white/60" />
                      </motion.div>
                      <span className="text-white/60">Uploading... {uploadProgress}%</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-white/60" />
                      <span className="text-white/60">Click to upload image</span>
                    </>
                  )}
                </label>

                {/* Progress Bar */}
                {isUploading && (
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}

                {/* Or enter URL manually */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-zinc-500">or enter URL</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-zinc-600"
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1 bg-white text-black py-4 rounded-full font-medium hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {mutation.isPending ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Package className="w-5 h-5" />
                    </motion.div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {product ? 'Update Product' : 'Create Product'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-8 border border-white/20 text-white py-4 rounded-full font-medium hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Check admin auth
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setLocation('/admin/login');
    }
  }, [setLocation]);

  // Fetch products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/products', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setLocation('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-black/40 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-light tracking-wider bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
                  NOCTURNE ADMIN
                </h1>
                <p className="text-zinc-500 text-sm">Product Management Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setLocation('/')}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all"
              >
                <Store className="w-4 h-4" />
                <span className="text-sm">View Store</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-full hover:bg-red-500/30 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Premium Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Package className="w-6 h-6 text-blue-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-zinc-400 text-sm mb-2">Total Products</div>
            <div className="font-serif text-4xl font-light text-white">{products.length}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="text-zinc-400 text-sm mb-2">In Stock</div>
            <div className="font-serif text-4xl font-light text-white">
              {products.filter(p => p.stock > 0).length}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
            </div>
            <div className="text-zinc-400 text-sm mb-2">Out of Stock</div>
            <div className="font-serif text-4xl font-light text-white">
              {products.filter(p => p.stock === 0).length}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Tag className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div className="text-zinc-400 text-sm mb-2">Categories</div>
            <div className="font-serif text-4xl font-light text-white">
              {new Set(products.map(p => p.category)).size}
            </div>
          </motion.div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="font-serif text-3xl font-light tracking-wide text-white mb-2">Product Catalog</h2>
            <p className="text-zinc-500 text-sm">Manage your luxury collection</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-zinc-200 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Package className="w-8 h-8 text-zinc-600" />
            </motion.div>
          </div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-96 bg-white/5 border border-white/10 rounded-3xl"
          >
            <div className="p-6 bg-white/10 rounded-full mb-6">
              <Package className="w-12 h-12 text-zinc-600" />
            </div>
            <h3 className="text-2xl font-light text-white mb-2">No Products Yet</h3>
            <p className="text-zinc-500 mb-8">Start building your luxury collection</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-zinc-200 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Your First Product
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard
                    product={product}
                    onEdit={setEditingProduct}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <ProductModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
          }}
        />
      )}
      {editingProduct && (
        <ProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={() => {
            setEditingProduct(null);
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
          }}
        />
      )}
    </div>
  );
}


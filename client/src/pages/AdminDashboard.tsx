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
  CheckCircle,
  BarChart3,
  Ticket,
  ShoppingBag,
  Users,
  Calendar,
  Percent,
  Truck,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

type TabType = 'products' | 'analytics' | 'coupons' | 'orders';

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  stock: number;
  sizes?: { XS: number; S: number; M: number; L: number; XL: number; XXL: number } | null;
}

interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: string;
  discountValue: string;
  minOrderAmount?: string;
  maxDiscount?: string;
  usageLimit?: number;
  usedCount?: number;
  validFrom?: string;
  validUntil?: string;
  isActive?: boolean;
}

interface Order {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  total: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  trackingNumber?: string;
}

interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: Order[];
  topProducts: { productId: string; name: string; totalSold: number; revenue: number }[];
  salesByDay: { date: string; revenue: number; orders: number }[];
  ordersByStatus: { status: string; count: number }[];
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

// Orders Tab Component
function OrdersTab() {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, trackingNumber }: { orderId: string; status: string; trackingNumber?: string }) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status, trackingNumber }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated!');
      setSelectedOrder(null);
      setTrackingNumber('');
    },
  });

  const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <ShoppingBag className="w-8 h-8 text-zinc-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-serif text-3xl font-light tracking-wide text-white mb-2">Orders</h2>
          <p className="text-zinc-500 text-sm">{orders.length} total orders</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
          <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-light text-white mb-2">No Orders Yet</h3>
          <p className="text-zinc-500">Orders will appear here when customers make purchases</p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left py-4 px-6 text-sm text-zinc-400 font-medium">Order ID</th>
                  <th className="text-left py-4 px-6 text-sm text-zinc-400 font-medium">Customer</th>
                  <th className="text-left py-4 px-6 text-sm text-zinc-400 font-medium">Amount</th>
                  <th className="text-left py-4 px-6 text-sm text-zinc-400 font-medium">Payment</th>
                  <th className="text-left py-4 px-6 text-sm text-zinc-400 font-medium">Status</th>
                  <th className="text-left py-4 px-6 text-sm text-zinc-400 font-medium">Date</th>
                  <th className="text-left py-4 px-6 text-sm text-zinc-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 text-sm text-white font-mono">#{order.id.slice(0, 8)}</td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm text-white">{order.userName || 'Guest'}</p>
                        <p className="text-xs text-zinc-500">{order.userEmail}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-white font-medium">₹{parseFloat(order.total).toLocaleString()}</td>
                    <td className="py-4 px-6 text-sm text-zinc-400 capitalize">{order.paymentMethod}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        order.status === 'shipped' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                        order.status === 'processing' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        order.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-xl text-white">Order #{selectedOrder.id.slice(0, 8)}</h3>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white/10 rounded-full">
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Customer</span>
                  <span className="text-white">{selectedOrder.userName || selectedOrder.userEmail}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Amount</span>
                  <span className="text-white">₹{parseFloat(selectedOrder.total).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Current Status</span>
                  <span className="text-white capitalize">{selectedOrder.status}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Update Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        onClick={() => updateStatusMutation.mutate({ orderId: selectedOrder.id, status, trackingNumber: status === 'shipped' ? trackingNumber : undefined })}
                        disabled={updateStatusMutation.isPending}
                        className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                          selectedOrder.status === status
                            ? 'bg-white text-black'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedOrder.status !== 'shipped' && selectedOrder.status !== 'delivered' && (
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Tracking Number (for shipped)</label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter tracking number..."
                      className="w-full bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-white/30"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Coupons Tab Component
function CouponsTab() {
  const queryClient = useQueryClient();
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const { data: coupons = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/coupons', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch coupons');
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete coupon');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success('Coupon deleted!');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Ticket className="w-8 h-8 text-zinc-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-serif text-3xl font-light tracking-wide text-white mb-2">Coupons</h2>
          <p className="text-zinc-500 text-sm">{coupons.length} active coupons</p>
        </div>
        <button
          onClick={() => setShowAddCoupon(true)}
          className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-zinc-200 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Coupon
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
          <Ticket className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-light text-white mb-2">No Coupons Yet</h3>
          <p className="text-zinc-500 mb-6">Create promotional codes to boost sales</p>
          <button
            onClick={() => setShowAddCoupon(true)}
            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-zinc-200 transition-all mx-auto"
          >
            <Plus className="w-5 h-5" />
            Create First Coupon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <motion.div
              key={coupon.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Percent className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-mono text-lg font-bold text-white">{coupon.code}</h3>
                    <p className="text-xs text-zinc-500">{coupon.description || 'No description'}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  coupon.isActive !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {coupon.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Discount</span>
                  <span className="text-white font-medium">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}%`
                      : `₹${parseFloat(coupon.discountValue).toLocaleString()}`}
                  </span>
                </div>
                {coupon.minOrderAmount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Min Order</span>
                    <span className="text-zinc-300">₹{parseFloat(coupon.minOrderAmount).toLocaleString()}</span>
                  </div>
                )}
                {coupon.usageLimit && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Usage</span>
                    <span className="text-zinc-300">{coupon.usedCount || 0} / {coupon.usageLimit}</span>
                  </div>
                )}
                {coupon.validUntil && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Expires</span>
                    <span className="text-zinc-300">{new Date(coupon.validUntil).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditingCoupon(coupon)}
                  className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete coupon "${coupon.code}"?`)) {
                      deleteMutation.mutate(coupon.id);
                    }
                  }}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Coupon Modal */}
      {(showAddCoupon || editingCoupon) && (
        <CouponModal
          coupon={editingCoupon}
          onClose={() => { setShowAddCoupon(false); setEditingCoupon(null); }}
          onSuccess={() => {
            setShowAddCoupon(false);
            setEditingCoupon(null);
            queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
          }}
        />
      )}
    </div>
  );
}

// Coupon Modal
function CouponModal({ coupon, onClose, onSuccess }: { coupon?: Coupon | null; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    code: coupon?.code || '',
    description: coupon?.description || '',
    discountType: coupon?.discountType || 'percentage',
    discountValue: coupon?.discountValue || '',
    minOrderAmount: coupon?.minOrderAmount || '',
    maxDiscount: coupon?.maxDiscount || '',
    usageLimit: coupon?.usageLimit?.toString() || '',
    validUntil: coupon?.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
    isActive: coupon?.isActive !== false,
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const token = localStorage.getItem('adminToken');
      const url = coupon ? `/api/admin/coupons/${coupon.id}` : '/api/admin/coupons';
      const method = coupon ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          ...data,
          usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
          minOrderAmount: data.minOrderAmount || null,
          maxDiscount: data.maxDiscount || null,
          validUntil: data.validUntil || null,
        }),
      });
      if (!response.ok) throw new Error('Failed to save coupon');
      return response.json();
    },
    onSuccess: () => {
      toast.success(coupon ? 'Coupon updated!' : 'Coupon created!');
      onSuccess();
    },
    onError: () => {
      toast.error('Failed to save coupon');
    },
  });

  return (
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
        className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-serif text-xl text-white">{coupon ? 'Edit Coupon' : 'Create Coupon'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData); }} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Coupon Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-white/30"
              placeholder="SAVE20"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-white/30"
              placeholder="20% off on all items"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Discount Type</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-white/30"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Discount Value</label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-white/30"
                placeholder={formData.discountType === 'percentage' ? '20' : '100'}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Min Order (₹)</label>
              <input
                type="number"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-white/30"
                placeholder="500"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Usage Limit</label>
              <input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-white/30"
                placeholder="100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Valid Until</label>
            <input
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              className="w-full bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-white/30"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isActive" className="text-sm text-zinc-300">Coupon is active</label>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-white text-black py-3 rounded-full font-medium hover:bg-zinc-200 transition-all disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving...' : (coupon ? 'Update Coupon' : 'Create Coupon')}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('products');

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

  // Fetch analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics>({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/analytics', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
    enabled: activeTab === 'analytics',
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

      {/* Tab Navigation */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'products' as TabType, label: 'Products', icon: Package },
              { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 },
              { id: 'orders' as TabType, label: 'Orders', icon: ShoppingBag },
              { id: 'coupons' as TabType, label: 'Coupons', icon: Ticket },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-white text-white bg-white/5'
                    : 'border-transparent text-zinc-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Products Tab */}
        {activeTab === 'products' && (
          <>
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
          </>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {analyticsLoading ? (
              <div className="flex items-center justify-center h-96">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <BarChart3 className="w-8 h-8 text-zinc-600" />
                </motion.div>
              </div>
            ) : analytics ? (
              <>
                {/* Analytics Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-green-500/20 rounded-xl">
                        <DollarSign className="w-6 h-6 text-green-400" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-green-400/70 text-sm mb-2">Total Revenue</div>
                    <div className="font-serif text-3xl font-light text-white">₹{analytics.totalRevenue.toLocaleString()}</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-blue-500/20 rounded-xl">
                        <ShoppingBag className="w-6 h-6 text-blue-400" />
                      </div>
                    </div>
                    <div className="text-blue-400/70 text-sm mb-2">Total Orders</div>
                    <div className="font-serif text-3xl font-light text-white">{analytics.totalOrders}</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-purple-500/20 rounded-xl">
                        <Users className="w-6 h-6 text-purple-400" />
                      </div>
                    </div>
                    <div className="text-purple-400/70 text-sm mb-2">Total Customers</div>
                    <div className="font-serif text-3xl font-light text-white">{analytics.totalCustomers}</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-orange-500/20 rounded-xl">
                        <Package className="w-6 h-6 text-orange-400" />
                      </div>
                    </div>
                    <div className="text-orange-400/70 text-sm mb-2">Total Products</div>
                    <div className="font-serif text-3xl font-light text-white">{analytics.totalProducts}</div>
                  </motion.div>
                </div>

                {/* Sales Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6"
                >
                  <h3 className="font-serif text-xl font-light text-white mb-6">Sales Overview (Last 7 Days)</h3>
                  <div className="h-64 flex items-end gap-2">
                    {analytics.salesByDay.map((day, index) => {
                      const maxRevenue = Math.max(...analytics.salesByDay.map(d => d.revenue), 1);
                      const height = (day.revenue / maxRevenue) * 100;
                      return (
                        <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full flex flex-col items-center">
                            <span className="text-xs text-zinc-400 mb-1">₹{day.revenue.toLocaleString()}</span>
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${Math.max(height, 5)}%` }}
                              transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                              className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg min-h-[20px]"
                            />
                          </div>
                          <span className="text-xs text-zinc-500">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Order Status Distribution */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6"
                  >
                    <h3 className="font-serif text-xl font-light text-white mb-6">Order Status</h3>
                    <div className="space-y-4">
                      {analytics.ordersByStatus.map((status) => {
                        const total = analytics.ordersByStatus.reduce((sum, s) => sum + s.count, 0);
                        const percentage = total > 0 ? (status.count / total) * 100 : 0;
                        const colors: Record<string, string> = {
                          pending: 'bg-yellow-500',
                          processing: 'bg-blue-500',
                          shipped: 'bg-purple-500',
                          delivered: 'bg-green-500',
                          cancelled: 'bg-red-500',
                        };
                        return (
                          <div key={status.status} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-zinc-400 capitalize">{status.status}</span>
                              <span className="text-white">{status.count} ({percentage.toFixed(0)}%)</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ delay: 0.7, duration: 0.5 }}
                                className={`h-full ${colors[status.status] || 'bg-zinc-500'} rounded-full`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* Top Products */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6"
                  >
                    <h3 className="font-serif text-xl font-light text-white mb-6">Top Selling Products</h3>
                    <div className="space-y-4">
                      {analytics.topProducts.length === 0 ? (
                        <p className="text-zinc-500 text-center py-8">No sales data yet</p>
                      ) : (
                        analytics.topProducts.slice(0, 5).map((product, index) => (
                          <div key={product.productId} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium truncate">{product.name}</p>
                              <p className="text-sm text-zinc-500">{product.totalSold} sold</p>
                            </div>
                            <div className="text-right">
                              <p className="text-green-400 font-medium">₹{product.revenue.toLocaleString()}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Recent Orders */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6"
                >
                  <h3 className="font-serif text-xl font-light text-white mb-6">Recent Orders</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 text-sm text-zinc-500 font-medium">Order ID</th>
                          <th className="text-left py-3 px-4 text-sm text-zinc-500 font-medium">Customer</th>
                          <th className="text-left py-3 px-4 text-sm text-zinc-500 font-medium">Amount</th>
                          <th className="text-left py-3 px-4 text-sm text-zinc-500 font-medium">Status</th>
                          <th className="text-left py-3 px-4 text-sm text-zinc-500 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.recentOrders.slice(0, 5).map((order) => (
                          <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 px-4 text-sm text-white font-mono">#{order.id.slice(0, 8)}</td>
                            <td className="py-3 px-4 text-sm text-zinc-300">{order.userName || order.userEmail || 'Guest'}</td>
                            <td className="py-3 px-4 text-sm text-white">₹{parseFloat(order.total).toLocaleString()}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                                order.status === 'shipped' ? 'bg-purple-500/20 text-purple-400' :
                                order.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                                order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-zinc-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </>
            ) : (
              <div className="text-center py-12 text-zinc-500">No analytics data available</div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <OrdersTab />
        )}

        {/* Coupons Tab */}
        {activeTab === 'coupons' && (
          <CouponsTab />
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


import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Lock, User, ArrowLeft, Shield, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('adminToken', data.token);
      setLocation('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/10 to-transparent rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo Section */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-xl rounded-2xl mb-6 border border-white/20"
          >
            <Shield className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="font-serif text-5xl font-light tracking-wider bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent mb-2">
            NOCTURNE
          </h1>
          <p className="text-zinc-500 text-sm tracking-wide">Administrator Portal</p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/10 rounded-xl">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-serif text-2xl font-light text-white tracking-wide">
              Secure Login
            </h2>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl mb-6 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-white/80 text-sm font-medium mb-3">
                <User className="w-4 h-4" />
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-zinc-600"
                placeholder="Enter your username"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-white/80 text-sm font-medium mb-3">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-zinc-600"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-4 rounded-full font-medium hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Lock className="w-5 h-5" />
                  </motion.div>
                  Signing In...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setLocation('/')}
              className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm mx-auto transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Store
            </button>
          </div>
        </motion.div>

        {/* Credentials Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
        >
          <p className="text-zinc-500 text-xs mb-2">Default Credentials:</p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-3 h-3 text-zinc-600" />
              <code className="text-zinc-400 font-mono">admin</code>
            </div>
            <div className="text-zinc-700">/</div>
            <div className="flex items-center gap-2">
              <Lock className="w-3 h-3 text-zinc-600" />
              <code className="text-zinc-400 font-mono">admin123</code>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}


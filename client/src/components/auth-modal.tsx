import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, ArrowLeft, Loader2 } from "lucide-react";
import { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } from "@/lib/firebase";

type AuthMode = "signin" | "signup" | "reset";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithGoogle();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (mode === "signup") {
        if (!name.trim()) {
          throw new Error("Please enter your name");
        }
        await signUpWithEmail(email, password, name);
      } else if (mode === "signin") {
        await signInWithEmail(email, password);
      } else if (mode === "reset") {
        await resetPassword(email);
        setResetSent(true);
        return;
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setError("");
    setResetSent(false);
  };

  const switchMode = (newMode: AuthMode) => {
    resetForm();
    setMode(newMode);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif text-2xl text-white tracking-wide">
              {mode === "signin" && "Welcome Back"}
              {mode === "signup" && "Create Account"}
              {mode === "reset" && "Reset Password"}
            </h2>
            <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {resetSent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-white mb-2">Password reset email sent!</p>
              <p className="text-zinc-400 text-sm mb-4">Check your inbox for instructions.</p>
              <button onClick={() => switchMode("signin")} className="text-white/70 hover:text-white text-sm">
                Back to Sign In
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {mode === "signup" && (
                  <div>
                    <label className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                      <User className="w-4 h-4" /> Full Name
                    </label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white/30"
                      placeholder="Enter your name" required />
                  </div>
                )}

                <div>
                  <label className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                    <Mail className="w-4 h-4" /> Email
                  </label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white/30"
                    placeholder="Enter your email" required />
                </div>

                {mode !== "reset" && (
                  <div>
                    <label className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                      <Lock className="w-4 h-4" /> Password
                    </label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-white/30"
                      placeholder={mode === "signup" ? "Create a password (6+ chars)" : "Enter your password"} required minLength={6} />
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full bg-white text-black py-3 rounded-full font-medium hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {mode === "signin" && "Sign In"}
                  {mode === "signup" && "Create Account"}
                  {mode === "reset" && "Send Reset Link"}
                </button>
              </form>

              {mode !== "reset" && (
                <>
                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-zinc-500 text-sm">or</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  <button onClick={handleGoogleSignIn} disabled={loading}
                    className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-full font-medium hover:bg-white/10 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>
                </>
              )}

              <div className="mt-6 text-center text-sm">
                {mode === "signin" && (
                  <>
                    <button onClick={() => switchMode("reset")} className="text-zinc-400 hover:text-white mb-2 block w-full">
                      Forgot password?
                    </button>
                    <span className="text-zinc-500">Don't have an account?{" "}</span>
                    <button onClick={() => switchMode("signup")} className="text-white hover:underline">
                      Sign Up
                    </button>
                  </>
                )}
                {mode === "signup" && (
                  <>
                    <span className="text-zinc-500">Already have an account?{" "}</span>
                    <button onClick={() => switchMode("signin")} className="text-white hover:underline">
                      Sign In
                    </button>
                  </>
                )}
                {mode === "reset" && (
                  <button onClick={() => switchMode("signin")} className="flex items-center gap-2 text-zinc-400 hover:text-white mx-auto">
                    <ArrowLeft className="w-4 h-4" /> Back to Sign In
                  </button>
                )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


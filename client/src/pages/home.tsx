import { Hero } from "@/components/hero";
import { NavBar } from "@/components/nav-bar";
import { ProductCard } from "@/components/product-card";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useLocation } from "wouter";
import { ArrowRight, Star, Instagram, Twitter, Mail, MapPin, Phone } from "lucide-react";
import chromeCross from "@assets/generated_images/3d_rendered_chrome_gothic_cross.png";

export default function Home() {
  const [, setLocation] = useLocation();

  const { data: featuredProducts = [] } = useQuery({
    queryKey: ["featured-products"],
    queryFn: api.products.getFeatured,
  });

  return (
    <div className="min-h-screen bg-black text-foreground selection:bg-white selection:text-black overflow-x-hidden">
      {/* CRT Overlay */}
      <div className="scanlines" />
      
      <NavBar />
      
      <main>
        <Hero />
        
        <section className="relative z-10 px-4 py-32 space-y-32">
          {/* Ambient light glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-white/5 blur-[150px] rounded-full -z-10 pointer-events-none" />

          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
              <div className="space-y-12 relative">
                 {/* Decorative 3D Element */}
                 <motion.img
                  src={chromeCross}
                  alt="Chrome Cross"
                  className="absolute -top-32 -left-32 w-64 h-64 opacity-30 mix-blend-lighten pointer-events-none blur-sm"
                  animate={{ 
                    rotate: [0, 360],
                    y: [0, 20, 0] 
                  }}
                  transition={{ 
                    rotate: { repeat: Infinity, duration: 60, ease: "linear" },
                    y: { repeat: Infinity, duration: 5, ease: "easeInOut" }
                  }}
                />

                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="relative z-10"
                >
                  <h2 className="font-display text-5xl md:text-6xl text-white leading-tight tracking-tighter">
                    THE <span className="font-serif italic text-metal">MIDNIGHT</span> <br />
                    COLLECTION
                  </h2>
                  <div className="w-24 h-1 bg-white mt-6 mb-8 skew-x-[-20deg] shadow-[0_0_10px_white]" />
                </motion.div>

                <motion.p 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="font-serif text-xl text-white/70 leading-relaxed max-w-md border-l border-white/20 pl-6"
                >
                  Forged in the digital void. Each piece is a unique artifact, blending 19th-century silhouettes with cyber-gothic aesthetics.
                </motion.p>

                <div className="flex gap-8 pt-4">
                  <div className="flex flex-col">
                    <span className="text-3xl font-display text-white">01</span>
                    <span className="text-xs tracking-widest text-white/40 uppercase mt-2">Edition</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-display text-white">∞</span>
                    <span className="text-xs tracking-widest text-white/40 uppercase mt-2">Supply</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center md:justify-end perspective-1000">
                <ProductCard />
              </div>
            </div>
          </div>

          {/* Featured Products Section */}
          {featuredProducts.length > 0 && (
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <span className="font-mono text-xs text-white/40 tracking-[0.5em]">CURATED SELECTION</span>
                <h2 className="font-display text-4xl md:text-5xl text-white mt-4 tracking-tight">
                  FEATURED <span className="font-serif italic text-metal">PIECES</span>
                </h2>
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-white to-transparent mx-auto mt-6" />
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProducts.slice(0, 3).map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    onClick={() => setLocation(`/product/${product.id}`)}
                    className="group cursor-pointer relative bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-sm overflow-hidden hover:border-white/30 transition-all duration-500"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10" />
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-white/60 text-white/60" />
                        ))}
                      </div>
                      <h3 className="font-display text-xl text-white tracking-wide group-hover:text-white/90 transition-colors">
                        {product.name}
                      </h3>
                      <p className="font-mono text-sm text-white/60 mt-1">₹{product.price}</p>
                    </div>
                    <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mt-12"
              >
                <button
                  onClick={() => setLocation("/shop")}
                  className="group inline-flex items-center gap-3 px-8 py-4 border border-white/20 text-white font-display text-sm tracking-widest hover:bg-white hover:text-black transition-all duration-300"
                >
                  VIEW ALL COLLECTION
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </button>
              </motion.div>
            </div>
          )}

          {/* Manifesto */}
          <div className="text-center space-y-6 py-32 border-t border-white/5 border-b relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out -z-10" />
            <span className="font-mono text-xs text-white/40 tracking-[0.5em] relative z-10 bg-black/50 px-4 py-1 border border-white/10 rounded-full">MANIFESTO</span>
            <p className="font-display text-3xl md:text-5xl text-white max-w-4xl mx-auto leading-normal relative z-10 mix-blend-difference">
              "WE WEAR THE <span className="italic font-serif text-white/50">DARKNESS</span> NOT TO HIDE, BUT TO REVEAL THE LIGHT WITHIN."
            </p>
          </div>

          {/* Newsletter Section */}
          <div className="max-w-2xl mx-auto text-center py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="font-display text-2xl text-white mb-4">JOIN THE NOCTURNE</h3>
              <p className="text-white/50 text-sm mb-8 max-w-md mx-auto">
                Subscribe to receive exclusive drops, early access, and dark inspirations.
              </p>
              <form className="flex gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-white/5 border border-white/20 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 transition-colors font-mono text-sm"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-black font-display text-sm tracking-widest hover:bg-white/90 transition-colors"
                >
                  SUBSCRIBE
                </button>
              </form>
            </motion.div>
          </div>
        </section>

        {/* Premium Footer */}
        <footer className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              {/* Brand */}
              <div className="md:col-span-1">
                <h2 className="font-gothic text-3xl text-white mb-4">NOCTURNE</h2>
                <p className="text-white/50 text-sm leading-relaxed">
                  Digital artifacts for the undying. Embrace the eternal darkness.
                </p>
                <div className="flex gap-4 mt-6">
                  <a href="#" className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300">
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300">
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300">
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Shop Links */}
              <div>
                <h4 className="font-display text-sm tracking-widest text-white mb-6">SHOP</h4>
                <ul className="space-y-3">
                  <li><a href="/shop" className="text-white/50 hover:text-white transition-colors text-sm">All Products</a></li>
                  <li><a href="/shop?category=corsets" className="text-white/50 hover:text-white transition-colors text-sm">Corsets</a></li>
                  <li><a href="/shop?category=dresses" className="text-white/50 hover:text-white transition-colors text-sm">Dresses</a></li>
                  <li><a href="/shop?category=accessories" className="text-white/50 hover:text-white transition-colors text-sm">Accessories</a></li>
                </ul>
              </div>

              {/* Support Links */}
              <div>
                <h4 className="font-display text-sm tracking-widest text-white mb-6">SUPPORT</h4>
                <ul className="space-y-3">
                  <li><a href="#" className="text-white/50 hover:text-white transition-colors text-sm">Contact Us</a></li>
                  <li><a href="#" className="text-white/50 hover:text-white transition-colors text-sm">Shipping Info</a></li>
                  <li><a href="#" className="text-white/50 hover:text-white transition-colors text-sm">Returns & Exchanges</a></li>
                  <li><a href="#" className="text-white/50 hover:text-white transition-colors text-sm">Size Guide</a></li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="font-display text-sm tracking-widest text-white mb-6">CONTACT</h4>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-white/50 text-sm">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>123 Shadow Lane, Mumbai 400001</span>
                  </li>
                  <li className="flex items-center gap-3 text-white/50 text-sm">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span>hello@nocturnelux.com</span>
                  </li>
                  <li className="flex items-center gap-3 text-white/50 text-sm">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>+91 98765 43210</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-white/30 text-xs font-mono tracking-widest">
                © 2025 NOCTURNE LUX • ALL RIGHTS RESERVED
              </p>
              <div className="flex gap-6 text-white/30 text-xs">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Cookies</a>
              </div>
            </div>
          </div>

          {/* Background watermark */}
          <h1 className="font-gothic text-[20vw] text-white/[0.02] leading-none select-none pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 -z-10 whitespace-nowrap">NOCTURNE</h1>
        </footer>
      </main>
    </div>
  );
}
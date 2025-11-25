import { Hero } from "@/components/hero";
import { NavBar } from "@/components/nav-bar";
import { ProductCard } from "@/components/product-card";
import { motion } from "framer-motion";
import chromeCross from "@assets/generated_images/3d_rendered_chrome_gothic_cross.png";

export default function Home() {
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

          <div className="text-center space-y-6 py-32 border-t border-white/5 border-b relative overflow-hidden group">
             {/* Hover reveal background */}
            <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out -z-10" />
            
            <span className="font-mono text-xs text-white/40 tracking-[0.5em] relative z-10 bg-black/50 px-4 py-1 border border-white/10 rounded-full">MANIFESTO</span>
            <p className="font-display text-3xl md:text-5xl text-white max-w-4xl mx-auto leading-normal relative z-10 mix-blend-difference">
              "WE WEAR THE <span className="italic font-serif text-white/50">DARKNESS</span> NOT TO HIDE, BUT TO REVEAL THE LIGHT WITHIN."
            </p>
          </div>
        </section>
        
        <footer className="pb-32 pt-12 text-center relative z-10 overflow-hidden">
          <h1 className="font-gothic text-[15vw] text-white/5 leading-none select-none pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 -z-10 whitespace-nowrap">NOCTURNE</h1>
          <div className="flex justify-center gap-8 mb-8 font-display text-xs tracking-widest text-white/60">
            <a href="#" className="hover:text-white hover:scale-110 transition-all">INSTAGRAM</a>
            <a href="#" className="hover:text-white hover:scale-110 transition-all">TWITTER</a>
            <a href="#" className="hover:text-white hover:scale-110 transition-all">DISCORD</a>
          </div>
          <p className="font-mono text-[10px] text-white/30 tracking-widest">
            © 2025 • MOCKUP MODE
          </p>
        </footer>
      </main>
    </div>
  );
}
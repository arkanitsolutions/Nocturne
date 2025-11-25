import { Hero } from "@/components/hero";
import { NavBar } from "@/components/nav-bar";
import { ProductCard } from "@/components/product-card";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-foreground selection:bg-white selection:text-black overflow-x-hidden">
      <NavBar />
      
      <main>
        <Hero />
        
        <section className="relative z-10 px-4 py-24 space-y-32">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <motion.h2 
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="font-display text-4xl md:text-5xl text-white leading-tight"
                >
                  THE <span className="font-serif italic text-white/60">MIDNIGHT</span> <br />
                  COLLECTION
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="font-serif text-lg text-white/60 leading-relaxed max-w-md"
                >
                  Forged in the digital void. Each piece is a unique artifact, blending 19th-century silhouettes with cyber-gothic aesthetics.
                </motion.p>
              </div>
              
              <ProductCard />
            </div>
          </div>

          <div className="text-center space-y-6 py-20 border-t border-white/5 border-b">
            <span className="font-mono text-xs text-white/40 tracking-[0.5em]">MANIFESTO</span>
            <p className="font-display text-2xl md:text-4xl text-white max-w-3xl mx-auto leading-normal">
              "WE WEAR THE DARKNESS NOT TO HIDE, BUT TO REVEAL THE LIGHT WITHIN."
            </p>
          </div>
        </section>
        
        <footer className="pb-32 pt-12 text-center">
          <h1 className="font-gothic text-4xl text-white/20">NOCTURNE</h1>
          <p className="font-mono text-[10px] text-white/20 mt-4 tracking-widest">
            © 2025 • MOCKUP MODE
          </p>
        </footer>
      </main>
    </div>
  );
}
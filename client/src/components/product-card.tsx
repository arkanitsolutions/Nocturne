import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import corsetImage from "@assets/generated_images/luxury_black_velvet_corset_product_shot.png";

export function ProductCard() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative w-full max-w-md mx-auto group"
    >
      {/* Glow effect behind card */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent blur-3xl -z-10 opacity-0 group-hover:opacity-50 transition-opacity duration-1000" />

      <div className="relative bg-black/40 backdrop-blur-sm border border-white/10 p-8 overflow-hidden hover:border-white/30 transition-colors duration-500">
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/40" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/40" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/40" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/40" />

        {/* Image */}
        <motion.div 
          className="relative aspect-[3/4] mb-8 overflow-hidden"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.5 }}
        >
          <img 
            src={corsetImage} 
            alt="Velvet Corset" 
            className="w-full h-full object-cover opacity-90 contrast-125"
          />
          
          {/* Overlay grain */}
          <div className="absolute inset-0 bg-noise mix-blend-overlay opacity-50" />
        </motion.div>

        {/* Content */}
        <div className="space-y-4 text-center">
          <h3 className="font-display text-2xl tracking-widest text-white">VELVET CORSET</h3>
          <div className="h-px w-12 bg-white/20 mx-auto" />
          <p className="font-serif text-white/60 italic">
            "Bound in shadows, draped in night."
          </p>
          <p className="font-mono text-sm tracking-widest text-white/80 pt-2">
            $450.00
          </p>
        </div>

        {/* Action */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-8 w-full border border-white/20 py-3 text-xs tracking-[0.2em] text-white hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-2 group/btn"
        >
          ACQUIRE <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-1" />
        </motion.button>
      </div>
    </motion.div>
  );
}
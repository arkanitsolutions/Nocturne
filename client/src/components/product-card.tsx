import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import corsetImage from "@assets/generated_images/luxury_black_velvet_corset_product_shot.png";

export function ProductCard() {
  // Mouse movement logic for 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);
  const glowX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const glowY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = event.clientX - rect.left;
    const mouseYPos = event.clientY - rect.top;
    const xPct = mouseXPos / width - 0.5;
    const yPct = mouseYPos / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative w-full max-w-md mx-auto perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative group transition-all duration-200 ease-linear"
      >
        {/* Dynamic Spotlight Effect */}
        <div 
          className="absolute inset-0 rounded-sm bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none mix-blend-overlay"
          style={{
            background: `radial-gradient(circle at ${glowX} ${glowY}, rgba(255,255,255,0.15), transparent 80%)`
          }}
        />

        {/* Glow effect behind card */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent blur-3xl -z-10 opacity-0 group-hover:opacity-50 transition-opacity duration-1000" 
          style={{ transform: "translateZ(-50px)" }}
        />

        <div className="relative bg-black/60 backdrop-blur-md border border-white/10 p-8 overflow-hidden transition-colors duration-500 shadow-2xl">
          {/* Decorative corners - Floating in 3D space */}
          <motion.div style={{ transform: "translateZ(20px)" }} className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/40" />
          <motion.div style={{ transform: "translateZ(20px)" }} className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/40" />
          <motion.div style={{ transform: "translateZ(20px)" }} className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/40" />
          <motion.div style={{ transform: "translateZ(20px)" }} className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/40" />

          {/* Image */}
          <motion.div 
            className="relative aspect-[3/4] mb-8 overflow-hidden"
            style={{ transform: "translateZ(30px)" }}
          >
            <img 
              src={corsetImage} 
              alt="Velvet Corset" 
              className="w-full h-full object-cover opacity-90 contrast-125 grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
            />
            
            {/* Overlay grain */}
            <div className="absolute inset-0 bg-noise mix-blend-overlay opacity-50" />
            
            {/* Shine effect on image */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
          </motion.div>

          {/* Content */}
          <div className="space-y-4 text-center">
            <motion.h3 
              style={{ transform: "translateZ(40px)" }}
              className="font-display text-2xl tracking-widest text-white drop-shadow-lg"
            >
              VELVET CORSET
            </motion.h3>
            <div className="h-px w-12 bg-white/20 mx-auto" />
            <motion.p 
              style={{ transform: "translateZ(20px)" }}
              className="font-serif text-white/60 italic"
            >
              "Bound in shadows, draped in night."
            </motion.p>
            <motion.p 
              style={{ transform: "translateZ(30px)" }}
              className="font-mono text-sm tracking-widest text-white/80 pt-2"
            >
              $450.00
            </motion.p>
          </div>

          {/* Action */}
          <motion.button
            style={{ transform: "translateZ(50px)" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-8 w-full border border-white/20 py-3 text-xs tracking-[0.2em] text-white hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-2 group/btn bg-black/50 backdrop-blur-sm"
          >
            ACQUIRE <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-1" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
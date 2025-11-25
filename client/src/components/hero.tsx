import { motion, useScroll, useTransform } from "framer-motion";
import heroBg from "@assets/generated_images/abstract_cyber-gothic_victorian_background.png";

export function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background Image with Parallax */}
      <motion.div 
        style={{ y }}
        className="absolute inset-0 z-0"
      >
        <img 
          src={heroBg} 
          alt="Background" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-8 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <h2 className="font-serif italic text-white/50 text-lg md:text-xl tracking-widest mb-4">
            EST. 2025
          </h2>
          <h1 className="font-gothic text-6xl md:text-9xl text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] mix-blend-difference">
            NOCTURNE
          </h1>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100px" }}
            transition={{ delay: 1, duration: 1 }}
            className="h-px bg-gradient-to-r from-transparent via-white to-transparent mx-auto mt-6"
          />
        </motion.div>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="font-display text-white/70 text-sm md:text-base tracking-[0.2em] max-w-md mx-auto leading-relaxed"
        >
          DIGITAL ARTIFACTS FOR THE MODERN VAMPIRE
        </motion.p>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        style={{ opacity }}
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-[0.3em] text-white/40 uppercase">Explore</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/0 via-white/50 to-white/0" />
      </motion.div>
    </section>
  );
}
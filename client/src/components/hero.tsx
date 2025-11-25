import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import heroBg from "@assets/generated_images/abstract_cyber-gothic_victorian_background.png";
import liquidChrome from "@assets/generated_images/liquid_chrome_abstract_3d_shape.png";

export function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 200]);
  const chromeY = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Mouse parallax for the 3D object
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 40,
        y: (e.clientY / window.innerHeight - 0.5) * 40,
      });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const springX = useSpring(mousePosition.x, { stiffness: 100, damping: 30 });
  const springY = useSpring(mousePosition.y, { stiffness: 100, damping: 30 });

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center perspective-1000">
      {/* Background Image with Parallax */}
      <motion.div 
        style={{ y }}
        className="absolute inset-0 z-0"
      >
        <img 
          src={heroBg} 
          alt="Background" 
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay" />
      </motion.div>

      {/* Floating 3D Liquid Chrome Object */}
      <motion.div
        className="absolute z-0 w-[800px] h-[800px] opacity-60 mix-blend-lighten pointer-events-none"
        style={{ 
          x: springX, 
          y: chromeY,
          rotate: springY 
        }}
        animate={{
          scale: [1, 1.05, 1],
          rotateZ: [0, 5, -5, 0]
        }}
        transition={{
          scale: { repeat: Infinity, duration: 10, ease: "easeInOut" },
          rotateZ: { repeat: Infinity, duration: 20, ease: "easeInOut" }
        }}
      >
        <img 
          src={liquidChrome} 
          alt="Liquid Metal" 
          className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.2)]"
        />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-8 px-4 mix-blend-difference">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <h2 className="font-serif italic text-white/50 text-lg md:text-xl tracking-widest mb-4">
            EST. 2025
          </h2>
          <h1 className="font-gothic text-7xl md:text-9xl tracking-tight text-chrome drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
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
          className="font-display text-white/80 text-sm md:text-base tracking-[0.2em] max-w-md mx-auto leading-relaxed drop-shadow-lg"
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
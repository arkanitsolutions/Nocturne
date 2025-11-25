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
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center perspective-1000 bg-black">
      {/* Background Image with Parallax */}
      <motion.div 
        style={{ y }}
        className="absolute inset-0 z-0"
      >
        <img 
          src={heroBg} 
          alt="Background" 
          className="w-full h-full object-cover opacity-20 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-black/50 to-black" />
      </motion.div>

      {/* Floating 3D Liquid Chrome Object - Moved behind text but visible */}
      <motion.div
        className="absolute z-10 w-[600px] h-[600px] md:w-[900px] md:h-[900px] opacity-80 pointer-events-none mix-blend-screen"
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
          className="w-full h-full object-contain"
        />
      </motion.div>

      {/* Grid Floor Effect */}
      <div className="absolute bottom-0 w-full h-1/2 bg-[linear-gradient(to_bottom,transparent,black),repeating-linear-gradient(90deg,rgba(255,255,255,0.03)_0px,rgba(255,255,255,0.03)_1px,transparent_1px,transparent_40px),repeating-linear-gradient(0deg,rgba(255,255,255,0.03)_0px,rgba(255,255,255,0.03)_1px,transparent_1px,transparent_40px)] [transform:perspective(500px)_rotateX(60deg)_scale(2)] pointer-events-none opacity-30" />

      {/* Content */}
      <div className="relative z-20 text-center space-y-6 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative"
        >
          <motion.h2 
            initial={{ letterSpacing: "0.5em", opacity: 0 }}
            animate={{ letterSpacing: "1em", opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="font-sans text-white text-xs md:text-sm tracking-[1em] mb-6 uppercase font-bold"
          >
            Est. MMXV
          </motion.h2>

          {/* Main Logo - High Visibility */}
          <div className="relative inline-block group">
            {/* Glitch/Ghost Effect Layers */}
            <h1 className="absolute top-0 left-0 w-full font-gothic text-8xl md:text-[10rem] tracking-tight text-transparent text-stroke-white opacity-20 blur-[2px] translate-x-[4px] group-hover:translate-x-[-4px] transition-transform duration-100">
              NOCTURNE
            </h1>
            <h1 className="absolute top-0 left-0 w-full font-gothic text-8xl md:text-[10rem] tracking-tight text-transparent text-stroke-white opacity-20 blur-[2px] translate-x-[-4px] group-hover:translate-x-[4px] transition-transform duration-100">
              NOCTURNE
            </h1>
            
            {/* Main Text */}
            <h1 className="relative font-gothic text-8xl md:text-[10rem] tracking-tight text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.6)] animate-glitch cursor-default leading-[0.9]">
              NOCTURNE
            </h1>
          </div>
          
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100px" }}
            transition={{ delay: 1, duration: 1 }}
            className="h-px bg-white box-shadow-[0_0_10px_white] mx-auto mt-12"
          />
        </motion.div>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="font-display text-white/90 text-sm md:text-lg tracking-[0.3em] max-w-lg mx-auto leading-relaxed drop-shadow-md pt-8"
        >
          DIGITAL ARTIFACTS FOR THE <span className="text-white font-semibold">UNDYING</span>
        </motion.p>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        style={{ opacity }}
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
      >
        <span className="text-[10px] tracking-[0.3em] text-white/60 uppercase font-bold">Scroll</span>
        <div className="w-px h-16 bg-gradient-to-b from-white via-white/50 to-transparent" />
      </motion.div>
    </section>
  );
}
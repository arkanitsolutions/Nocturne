import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSwipeable } from "react-swipeable";
import { useRef, useState } from "react";

interface CategoryChipsProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryChips({ categories, selectedCategory, onSelectCategory }: CategoryChipsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftGradient(scrollLeft > 10);
    setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" }),
    onSwipedRight: () => scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" }),
    trackMouse: true,
  });

  return (
    <div className="relative px-4 py-4 bg-black">
      {/* Left Gradient */}
      {showLeftGradient && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      )}
      
      {/* Right Gradient */}
      {showRightGradient && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
      )}

      <div 
        {...handlers}
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectCategory(null)}
          className={cn(
            "px-4 py-2 text-xs font-semibold tracking-wider whitespace-nowrap transition-all flex-shrink-0 touch-manipulation",
            selectedCategory === null
              ? "bg-white text-black"
              : "bg-white/10 text-white border border-white/20"
          )}
          data-testid="chip-all"
        >
          ALL
        </motion.button>
        
        {categories.map((category) => (
          <motion.button
            key={category}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectCategory(category)}
            className={cn(
              "px-4 py-2 text-xs font-semibold tracking-wider whitespace-nowrap transition-all flex-shrink-0 touch-manipulation",
              selectedCategory === category
                ? "bg-white text-black"
                : "bg-white/10 text-white border border-white/20"
            )}
            data-testid={`chip-${category.toLowerCase()}`}
          >
            {category.toUpperCase()}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
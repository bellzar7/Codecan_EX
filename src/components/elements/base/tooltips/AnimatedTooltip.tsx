import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import type React from "react";
import { useState } from "react";

interface AnimatedTooltipProps {
  children: React.ReactNode;
  content: string | React.ReactNode;
  position?: "top" | "bottom" | "start" | "end";
  classNames?: string;
}

export const AnimatedTooltip: React.FC<AnimatedTooltipProps> = ({
  children,
  content,
  position = "top",
  classNames,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(50); // Centered initial value

  const handleMouseMove = (event: any) => {
    const rect = event.currentTarget.getBoundingClientRect();
    // Reduce range to make the effect barely noticeable
    x.set(((event.clientX - rect.left) / rect.width) * 100);
  };

  return (
    <div
      className={`tooltip-wrapper ${classNames || ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {children}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 260,
                damping: 20,
              },
            }}
            className={`tooltip tooltip-${position} -translate-x-1/2 cursor-help flex-col items-center justify-center rounded-md px-4 py-2 text-xs shadow-xl`}
            exit={{ opacity: 0, y: 18, scale: 0.6 }}
            initial={{ opacity: 0, y: 20, scale: 0.6 }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

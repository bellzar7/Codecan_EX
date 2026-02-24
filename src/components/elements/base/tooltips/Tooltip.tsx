"use client";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import type React from "react";
import { useState } from "react";

interface TooltipProps {
  children: React.ReactNode;
  content?: string; // Made optional
  position?: "top" | "bottom" | "start" | "end";
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = "top",
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const springConfig = { stiffness: 100, damping: 5 };
  const x = useMotionValue(0);

  const rotate = useSpring(
    useTransform(x, [-100, 100], [-20, 20]),
    springConfig
  );
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-30, 30]),
    springConfig
  );

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const halfWidth = rect.width / 2;
    x.set(event.nativeEvent.offsetX - halfWidth);
  };

  const positionClasses = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    start: "right-full mr-2 top-1/2 -translate-y-1/2",
    end: "left-full ml-2 top-1/2 -translate-y-1/2",
  };

  const getLines = (pos: "top" | "bottom" | "start" | "end") => {
    switch (pos) {
      case "top":
        return (
          <>
            <div className="pointer-events-none absolute bottom-0 left-1/2 z-30 h-px w-10 -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
            <div className="pointer-events-none absolute bottom-0 left-1/2 z-29 h-px w-10 -translate-x-1/2 bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
          </>
        );
      case "bottom":
        return (
          <>
            <div className="pointer-events-none absolute top-0 left-1/2 z-30 h-px w-10 -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
            <div className="pointer-events-none absolute top-0 left-1/2 z-29 h-px w-10 -translate-x-1/2 bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
          </>
        );
      case "start":
        return (
          <>
            <div className="pointer-events-none absolute top-1/2 right-0 z-30 h-6 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-emerald-500 to-transparent" />
            <div className="pointer-events-none absolute top-1/2 right-0 z-29 h-6 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-sky-500 to-transparent" />
          </>
        );
      case "end":
        return (
          <>
            <div className="pointer-events-none absolute top-1/2 left-0 z-30 h-6 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-emerald-500 to-transparent" />
            <div className="pointer-events-none absolute top-1/2 left-0 z-29 h-6 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-sky-500 to-transparent" />
          </>
        );
    }
  };

  if (!content) {
    return <>{children}</>;
  }

  return (
    <div
      className={`relative inline-block ${className || ""}`}
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
              scale: 1,
              y: 0,
              transition: {
                type: "spring",
                stiffness: 260,
                damping: 10,
              },
            }}
            className={`absolute z-50 flex flex-col items-center justify-center rounded-md bg-white px-4 py-2 text-black text-xs dark:bg-black dark:text-white ${positionClasses[position]} transition-colors duration-300`}
            exit={{ opacity: 0, scale: 0.9, y: 5 }}
            initial={{ opacity: 0, scale: 0.9, y: 5 }}
            style={{
              rotate,
              translateX,
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            {getLines(position)}
            <div className="relative z-40 text-sm">{content}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

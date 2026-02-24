"use client";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";

export const TracingBeam = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const contentRef = useRef<HTMLDivElement>(null);
  const [svgHeight, setSvgHeight] = useState(0);

  const updateSvgHeight = () => {
    if (contentRef.current) {
      setSvgHeight(contentRef.current.offsetHeight);
    }
  };

  useEffect(() => {
    updateSvgHeight();
    window.addEventListener("resize", updateSvgHeight);
    return () => window.removeEventListener("resize", updateSvgHeight);
  }, []);

  // Force a re-render after initial render to ensure height is accurate
  useEffect(() => {
    setTimeout(updateSvgHeight, 100);
  }, []);

  const y1 = useSpring(useTransform(scrollYProgress, [0, 1], [50, svgHeight]), {
    stiffness: 500,
    damping: 90,
  });

  const y2 = useSpring(
    useTransform(scrollYProgress, [0, 1], [50, svgHeight - 200]),
    { stiffness: 500, damping: 90 }
  );

  return (
    <motion.div
      className={cn("relative mx-auto h-full w-full max-w-2xl", className)}
      ref={ref}
    >
      <div className="absolute top-3 -left-4">
        <motion.div
          animate={{
            boxShadow:
              scrollYProgress.get() > 0
                ? "none"
                : "rgba(0, 0, 0, 0.24) 0px 3px 8px",
          }}
          className="ml-[27px] flex h-4 w-4 items-center justify-center rounded-full border border-neutral-200 shadow-xs"
          transition={{
            duration: 0.2,
            delay: 0.5,
          }}
        >
          <motion.div
            animate={{
              backgroundColor:
                scrollYProgress.get() > 0 ? "white" : "var(--emerald-500)",
              borderColor:
                scrollYProgress.get() > 0 ? "white" : "var(--emerald-600)",
            }}
            className="h-2 w-2 rounded-full border border-neutral-300 bg-white"
            transition={{
              duration: 0.2,
              delay: 0.5,
            }}
          />
        </motion.div>
        <svg
          aria-hidden="true"
          className="ml-4 block"
          height={svgHeight}
          viewBox={`0 0 20 ${svgHeight}`}
          width="20"
        >
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="#9091A0"
            strokeOpacity="0.16"
          />
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="1.25"
            transition={{ duration: 10 }}
          />
          <defs>
            <motion.linearGradient
              gradientUnits="userSpaceOnUse"
              id="gradient"
              x1="0"
              x2="0"
              y1={y1}
              y2={y2}
            >
              <stop stopColor="#18CCFC" stopOpacity="0" />
              <stop stopColor="#18CCFC" />
              <stop offset="0.325" stopColor="#6344F5" />
              <stop offset="1" stopColor="#AE48FF" stopOpacity="0" />
            </motion.linearGradient>
          </defs>
        </svg>
      </div>
      <div ref={contentRef}>{children}</div>
    </motion.div>
  );
};

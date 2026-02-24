import type { VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import React, { type ButtonHTMLAttributes, type FC } from "react";
import Loader from "@/components/elements/base/loader/Loader";
import { buttonVariants } from "@/components/elements/variants/button-variants";
import { buttonMotionVariants } from "@/utils/animations";

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  loading?: boolean;
  animated?: boolean;
}

const Button: FC<ButtonProps> = ({
  children,
  variant,
  color,
  shape,
  size = "md",
  shadow,
  className: classes,
  loading = false,
  animated = true,
  ...props
}) => {
  return (
    <motion.div
      initial="initial"
      variants={animated ? buttonMotionVariants : {}}
      whileHover="hover"
      whileTap="tap"
    >
      <button
        className={buttonVariants({
          variant,
          color,
          shape,
          size,
          shadow,
          className: `inline-flex items-center gap-1 whitespace-nowrap text-center text-sm ${
            loading ? "pointer-events-none relative text-transparent!" : ""
          } ${classes}`,
        })}
        {...props}
      >
        {children}
        {loading ? (
          <Loader
            classNames={
              "absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"
            }
            size={20}
            thickness={4}
          />
        ) : (
          ""
        )}
      </button>
    </motion.div>
  );
};

export default Button;

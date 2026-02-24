import type { VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import Link from "next/link";
import React, { type ButtonHTMLAttributes, type FC } from "react";
import Loader from "@/components/elements/base/loader/Loader";
import { buttonVariants } from "@/components/elements/variants/button-variants";
import { buttonMotionVariants } from "@/utils/animations";

interface ButtonLinkProps
  extends Omit<ButtonHTMLAttributes<HTMLAnchorElement>, "color">,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  href: string;
  loading?: boolean;
  animated?: boolean;
}

const ButtonLink: FC<ButtonLinkProps> = ({
  children,
  variant,
  color,
  shape,
  size = "md",
  shadow,
  className: classes,
  loading = false,
  animated = true,
  href,
  ...props
}) => {
  return (
    <motion.div
      initial="initial"
      variants={animated ? buttonMotionVariants : {}}
      whileHover="hover"
      whileTap="tap"
    >
      <Link
        className={buttonVariants({
          variant,
          color,
          shape,
          size,
          shadow,
          className: `inline-flex h-10 items-center justify-center whitespace-nowrap px-4 py-2 text-center text-sm ${
            loading ? "pointer-events-none relative text-transparent!" : ""
          }  ${classes}`,
        })}
        href={href}
        {...props}
      >
        {children}
        {loading && (
          <Loader
            classNames={
              "absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"
            }
            size={20}
            thickness={4}
          />
        )}
      </Link>
    </motion.div>
  );
};

export default ButtonLink;

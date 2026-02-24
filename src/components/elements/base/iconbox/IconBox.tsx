import { Icon, type IconifyIcon } from "@iconify/react";
import type { VariantProps } from "class-variance-authority";
import type React from "react";
import type { FC } from "react";
import { iconboxVariants } from "@/components/elements/variants/iconbox-variants";

interface IconBoxProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof iconboxVariants> {
  icon: IconifyIcon | string;
  iconClasses?: string;
  mask?: "hex" | "hexed" | "blob" | "deca" | "diamond";
  rotating?: boolean;
}

const IconBox: FC<IconBoxProps> = ({
  variant,
  color = "default",
  icon,
  shape = "full",
  size = "md",
  mask,
  shadow,
  className: classes = "",
  iconClasses = "",
  rotating = false,
  ...props
}) => {
  return (
    <div
      className={iconboxVariants({
        variant,
        color,
        shape,
        size,
        shadow,
        className: `relative flex shrink-0 items-center justify-center ${classes} 
        ${
          shape === "straight" && variant !== "outlined" && mask === "hex"
            ? "mask mask-hex"
            : ""
        } 
        ${
          shape === "straight" && variant !== "outlined" && mask === "hexed"
            ? "mask mask-hexed"
            : ""
        } 
        ${
          shape === "straight" && variant !== "outlined" && mask === "blob"
            ? "mask mask-blob"
            : ""
        } 
        ${
          shape === "straight" && variant !== "outlined" && mask === "deca"
            ? "mask mask-deca"
            : ""
        } 
        ${
          shape === "straight" && variant !== "outlined" && mask === "diamond"
            ? "mask mask-diamond"
            : ""
        }`,
      })}
      {...props}
    >
      <Icon
        className={`${iconClasses} ${rotating ? "rotating" : ""}`}
        icon={icon}
      />
    </div>
  );
};

export default IconBox;

import { Icon } from "@iconify/react";
import type { VariantProps } from "class-variance-authority";
import type React from "react";
import type { FC } from "react";
import { checkboxVariants } from "@/components/elements/variants/checkbox-variants";

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "color">,
    VariantProps<typeof checkboxVariants> {
  label?: string | React.ReactNode;
}

const Checkbox: FC<CheckboxProps> = ({
  id,
  color = "default",
  shape = "smooth",
  label,
  className: classes = "",
  ...props
}) => {
  return (
    <div
      className={`checkbox-${
        color || "default"
      } relative inline-block cursor-pointer overflow-hidden leading-tight`}
    >
      <label className="flex items-center" htmlFor={id}>
        <span
          className={`relative flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden border-2 border-muted-300 bg-muted-100 transition-shadow duration-300 dark:border-muted-700 dark:bg-muted-800 ${shape === "rounded-sm" ? "rounded-sm" : ""} 
          ${shape === "smooth" ? "rounded-md" : ""} 
          ${shape === "curved" ? "rounded-lg" : ""} 
          ${shape === "full" ? "rounded-full" : ""}
          ${color === "primary" ? "focus-within:border-primary-500/20" : ""}
          ${color === "info" ? "focus-within:border-info-500/20" : ""}
          ${color === "success" ? "focus-within:border-success-500/20" : ""}
          ${color === "warning" ? "focus-within:border-warning-500/20" : ""}
          ${color === "danger" ? "focus-within:border-danger-500/20" : ""}
        `}
        >
          <input
            className={`peer absolute top-0 left-0 z-3 h-full w-full cursor-pointer appearance-none ${classes}`}
            id={id}
            type="checkbox"
            {...props}
          />
          <Icon
            className={`relative left-0 z-2 h-3 w-3 translate-y-5 scale-0 transition-transform delay-150 duration-300 peer-checked:translate-y-0 peer-checked:scale-100 ${
              color === "default"
                ? "text-muted-700 dark:text-muted-100"
                : "text-white"
            }
            `}
            icon="fluent:checkmark-12-filled"
          />
          <span className={`${checkboxVariants({ color, shape })}`} />
        </span>
        {label && (
          <span className="ms-2 cursor-pointer font-sans text-muted-400 text-sm">
            {label}
          </span>
        )}
      </label>
    </div>
  );
};

export default Checkbox;

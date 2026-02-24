import { cva } from "class-variance-authority";

export const checkboxVariants = cva(
  "absolute top-0 left-0 z-1 block h-full w-full scale-0 transition-transform duration-300 peer-checked:scale-[1.1]",
  {
    variants: {
      color: {
        primary: "border-primary-500 bg-primary-500",
        info: "border-info-500 bg-info-500",
        success: "border-success-500 bg-success-500",
        warning: "border-warning-500 bg-warning-500",
        danger: "border-danger-500 bg-danger-500",
        default: "bg-muted-300 dark:bg-muted-700",
      },
      shape: {
        straight: "",
        "rounded-sm": "rounded-sm",
        rounded: "rounded",
        smooth: "rounded-md",
        curved: "rounded-lg",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      color: "default",
      shape: "smooth",
    },
  }
);

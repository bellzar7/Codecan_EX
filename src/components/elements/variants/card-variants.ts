import { cva } from "class-variance-authority";

export const cardVariants = cva("relative w-full transition-all duration-300", {
  variants: {
    color: {
      default:
        "border border-muted-200 bg-white dark:border-muted-700 dark:bg-muted-800",
      contrast:
        "border border-muted-200 bg-white dark:border-muted-800 dark:bg-muted-900",
      muted:
        "border border-muted-200 bg-muted-100 dark:border-muted-700 dark:bg-muted-800",
      mutedContrast:
        "border border-muted-200 bg-muted-100 dark:border-muted-800 dark:bg-muted-900",
      primary:
        "border border-primary-500 bg-primary-500/10 dark:bg-primary-500/20",
      info: "border border-info-500 bg-info-500/10 dark:bg-info-500/20",
      success:
        "border border-success-500 bg-success-500/10 dark:bg-success-500/20",
      warning:
        "border border-warning-500 bg-warning-500/10 dark:bg-warning-500/20",
      danger: "border border-danger-500 bg-danger-500/10 dark:bg-danger-500/20",
    },
    shape: {
      straight: "",
      rounded: "rounded-md",
      "rounded-xs": "rounded-xs",
      "rounded-sm": "rounded-sm",
      smooth: "rounded-lg",
      curved: "rounded-xl",
    },
    shadow: {
      flat: "shadow-muted-300/30 shadow-xl dark:shadow-muted-800/20",
      hover:
        "hover:shadow-muted-300/30 hover:shadow-xl dark:hover:shadow-muted-900/20",
      none: "",
    },
  },
  defaultVariants: {
    color: "default",
    shape: "smooth",
    shadow: "none",
  },
});

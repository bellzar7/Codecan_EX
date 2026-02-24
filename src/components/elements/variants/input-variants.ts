import { cva } from "class-variance-authority";

export const inputVariants = cva(
  "relative w-full font-sans leading-tight outline-hidden transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      color: {
        default:
          "border border-muted-200 bg-white text-muted-600 placeholder:text-muted-300 focus-visible:border-muted-300 focus-visible:shadow-lg focus-visible:shadow-muted-300/30 focus-visible:outline-hidden hover:enabled:border-muted-300 dark:border-muted-700 dark:bg-muted-800 dark:text-muted-300 dark:focus-visible:shadow-muted-800/20 dark:hover:enabled:border-muted-600 dark:placeholder:text-muted-600",
        contrast:
          "border border-muted-200 bg-white text-muted-600 placeholder:text-muted-300 focus-visible:border-muted-300 focus-visible:shadow-lg focus-visible:shadow-muted-300/30 focus-visible:outline-hidden hover:enabled:border-muted-300 dark:border-muted-800 dark:bg-muted-900 dark:text-muted-300 dark:focus-visible:shadow-muted-900/20 dark:hover:enabled:border-muted-700 dark:placeholder:text-muted-700",
        muted:
          "border border-muted-200 bg-muted-100 text-muted-600 placeholder:text-muted-400/60 focus-visible:border-muted-300 focus-visible:shadow-lg focus-visible:shadow-muted-300/30 focus-visible:outline-hidden hover:enabled:border-muted-300 dark:border-muted-700 dark:bg-muted-800 dark:text-muted-300 dark:focus-visible:shadow-muted-800/20 dark:hover:enabled:border-muted-600 dark:placeholder:text-muted-600",
        mutedContrast:
          "border border-muted-200 bg-muted-100 text-muted-600 placeholder:text-muted-400/60 focus-visible:border-muted-300 focus-visible:shadow-lg focus-visible:shadow-muted-300/30 focus-visible:outline-hidden hover:enabled:border-muted-300 dark:border-muted-800 dark:bg-muted-900 dark:text-muted-300 dark:focus-visible:shadow-muted-900/20 dark:hover:enabled:border-muted-700 dark:placeholder:text-muted-700",
      },
      shape: {
        straight: "",
        "rounded-xs": "rounded-xs",
        "rounded-sm": "rounded-sm",
        rounded: "rounded-md",
        smooth: "rounded-lg",
        curved: "rounded-xl",
        full: "rounded-full",
      },
      size: {
        xs: "h-6 py-1 text-xs",
        sm: "h-8 py-2 text-xs",
        md: "h-10 py-2 text-sm",
        lg: "h-12 py-2 text-base",
      },
    },
    defaultVariants: {
      shape: "smooth",
      color: "default",
      size: "md",
    },
  }
);

export const colorInputVariants = cva(
  "relative w-full font-sans leading-tight outline-hidden transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      color: {
        default:
          "border border-muted-200 bg-white text-muted-600 placeholder:text-muted-300 focus-visible:border-muted-300 focus-visible:shadow-lg focus-visible:shadow-muted-300/30 focus-visible:outline-hidden hover:enabled:border-muted-300 dark:border-muted-700 dark:bg-muted-800 dark:text-muted-300 dark:focus-visible:shadow-muted-800/20 dark:hover:enabled:border-muted-600 dark:placeholder:text-muted-600",
        contrast:
          "border border-muted-200 bg-white text-muted-600 placeholder:text-muted-300 focus-visible:border-muted-300 focus-visible:shadow-lg focus-visible:shadow-muted-300/30 focus-visible:outline-hidden hover:enabled:border-muted-300 dark:border-muted-800 dark:bg-muted-900 dark:text-muted-300 dark:focus-visible:shadow-muted-900/20 dark:hover:enabled:border-muted-700 dark:placeholder:text-muted-700",
        muted:
          "border border-muted-200 bg-muted-100 text-muted-600 placeholder:text-muted-400/60 focus-visible:border-muted-300 focus-visible:shadow-lg focus-visible:shadow-muted-300/30 focus-visible:outline-hidden hover:enabled:border-muted-300 dark:border-muted-700 dark:bg-muted-800 dark:text-muted-300 dark:focus-visible:shadow-muted-800/20 dark:hover:enabled:border-muted-600 dark:placeholder:text-muted-600",
        mutedContrast:
          "border border-muted-200 bg-muted-100 text-muted-600 placeholder:text-muted-400/60 focus-visible:border-muted-300 focus-visible:shadow-lg focus-visible:shadow-muted-300/30 focus-visible:outline-hidden hover:enabled:border-muted-300 dark:border-muted-800 dark:bg-muted-900 dark:text-muted-300 dark:focus-visible:shadow-muted-900/20 dark:hover:enabled:border-muted-700 dark:placeholder:text-muted-700",
      },
      shape: {
        straight: "",
        "rounded-xs": "rounded-xs",
        "rounded-sm": "rounded-sm",
        rounded: "rounded-md",
        smooth: "rounded-lg",
        curved: "rounded-xl",
        full: "rounded-full",
      },
      size: {
        sm: "h-8 py-1 text-xs",
        md: "h-10 py-1 text-sm",
        lg: "h-12 py-1 text-base",
      },
    },
    defaultVariants: {
      shape: "smooth",
      color: "default",
      size: "md",
    },
  }
);

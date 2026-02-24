import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "relative inline-flex cursor-pointer items-center justify-center gap-1 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      color: {
        default: "",
        contrast: "",
        muted: "",
        primary: "",
        info: "",
        success: "",
        warning: "",
        danger: "",
      },
      variant: {
        solid: "",
        pastel: "",
        outlined: "",
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
        sm: "h-8 px-2.5 py-2",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-5 py-2",
      },
      shadow: {
        none: "",
        default: "hover:enabled:shadow-xl",
        contrast: "hover:enabled:shadow-xl",
        muted: "hover:enabled:shadow-xl",
        primary:
          "hover:enabled:shadow-primary-500/50 hover:enabled:shadow-xl dark:hover:enabled:shadow-primary-800/20",
        info: "hover:enabled:shadow-info-500/50 hover:enabled:shadow-xl dark:hover:enabled:shadow-info-800/20",
        success:
          "hover:enabled:shadow-success-500/50 hover:enabled:shadow-xl dark:hover:enabled:shadow-success-800/20",
        warning:
          "hover:enabled:shadow-warning-500/50 hover:enabled:shadow-xl dark:hover:enabled:shadow-warning-800/20",
        danger:
          "hover:enabled:shadow-danger-500/50 hover:enabled:shadow-xl dark:hover:enabled:shadow-danger-800/20",
      },
    },

    compoundVariants: [
      {
        color: "default",
        variant: "solid",
        className:
          "border border-muted-200 bg-white text-muted-800 active:enabled:bg-muted-100 hover:enabled:border-muted-300 hover:enabled:bg-muted-50 dark:border-muted-700 dark:bg-muted-800 dark:text-muted-100 dark:active:enabled:bg-muted-800 dark:hover:enabled:border-muted-600 dark:hover:enabled:bg-muted-700 [&>span>.loader]:text-muted-500 dark:[&>span>.loader]:text-muted-200",
      },
      {
        color: "contrast",
        variant: "solid",
        className:
          "border border-muted-200 bg-white text-muted-800 active:enabled:bg-muted-100 hover:enabled:border-muted-300 hover:enabled:bg-muted-50 dark:border-muted-800 dark:bg-muted-900 dark:text-muted-100 dark:active:enabled:bg-muted-900 dark:hover:enabled:border-muted-700 dark:hover:enabled:bg-muted-900 [&>span>.loader]:text-muted-500 dark:[&>span>.loader]:text-muted-200",
      },
      {
        color: "muted",
        variant: "solid",
        className:
          "border border-muted-200 bg-muted-200 text-muted-500 active:enabled:bg-muted-100 enabled:hover:bg-muted-300 dark:border-muted-700 dark:bg-muted-800 dark:text-muted-100 dark:active:enabled:bg-muted-800 dark:enabled:hover:bg-muted-700 [&>span>.loader]:text-muted-500 dark:[&>span>.loader]:text-muted-200",
      },
      {
        color: "primary",
        variant: "solid",
        className:
          "border border-primary-500 bg-primary-500 text-white active:enabled:bg-primary-400 enabled:hover:bg-primary-600 [&>span>.loader]:text-muted-100",
      },
      {
        color: "info",
        variant: "solid",
        className:
          "border border-info-500 bg-info-500 text-white active:enabled:bg-info-400 enabled:hover:bg-info-600 [&>span>.loader]:text-muted-100",
      },
      {
        color: "success",
        variant: "solid",
        className:
          "border border-success-500 bg-success-500 text-white active:enabled:bg-success-400 enabled:hover:bg-success-600 [&>span>.loader]:text-muted-100",
      },
      {
        color: "warning",
        variant: "solid",
        className:
          "border border-warning-500 bg-warning-500 text-white active:enabled:bg-warning-400 enabled:hover:bg-warning-600 [&>span>.loader]:text-muted-100",
      },
      {
        color: "danger",
        variant: "solid",
        className:
          "border border-danger-500 bg-danger-500 text-white active:enabled:bg-danger-400 enabled:hover:bg-danger-600 [&>span>.loader]:text-muted-100",
      },
      {
        color: "default",
        variant: "pastel",
        className:
          "border-none bg-muted-300/30 text-muted-500 active:enabled:bg-muted-300/30 enabled:hover:bg-muted-300/60 dark:bg-muted-300/10 dark:text-muted-400 dark:active:enabled:bg-muted-300/10 dark:enabled:hover:bg-muted-300/20 [&>span>.loader]:text-muted-500 dark:[&>span>.loader]:text-muted-200",
      },

      {
        color: "contrast",
        variant: "pastel",
        className:
          "border-none bg-muted-300/30 text-muted-500 active:enabled:bg-muted-300/30 enabled:hover:bg-muted-300/60 dark:bg-muted-300/10 dark:text-muted-400 dark:active:enabled:bg-muted-300/10 dark:enabled:hover:bg-muted-300/20 [&>span>.loader]:text-muted-500 dark:[&>span>.loader]:text-muted-200",
      },
      {
        color: "muted",
        variant: "pastel",
        className:
          "bg-muted-300/30 text-muted-500 active:enabled:bg-muted-300/30 enabled:hover:bg-muted-300/60 dark:bg-muted-300/10 dark:text-muted-400 dark:active:enabled:bg-muted-300/10 dark:enabled:hover:bg-muted-300/20 [&>span>.loader]:text-muted-500 dark:[&>span>.loader]:text-muted-200",
      },
      {
        color: "primary",
        variant: "pastel",
        className:
          "bg-primary-500/10 text-primary-500 active:enabled:bg-primary-500/10 enabled:hover:bg-primary-500/20 dark:bg-primary-500/20 dark:active:enabled:bg-primary-500/10 dark:enabled:hover:bg-primary-500/30 [&>span>.loader]:text-primary-500",
      },
      {
        color: "info",
        variant: "pastel",
        className:
          "bg-info-500/10 text-info-500 active:enabled:bg-info-500/10 enabled:hover:bg-info-500/20 dark:bg-info-500/20 dark:active:enabled:bg-info-500/10 dark:enabled:hover:bg-info-500/30 [&>span>.loader]:text-info-500",
      },
      {
        color: "success",
        variant: "pastel",
        className:
          "bg-success-500/10 text-success-500 active:enabled:bg-success-500/10 enabled:hover:bg-success-500/20 dark:bg-success-500/20 dark:active:enabled:bg-success-500/10 dark:enabled:hover:bg-success-500/30 [&>span>.loader]:text-success-500",
      },
      {
        color: "warning",
        variant: "pastel",
        className:
          "bg-warning-500/10 text-warning-500 active:enabled:bg-warning-500/10 enabled:hover:bg-warning-500/20 dark:bg-warning-500/20 dark:active:enabled:bg-warning-500/10 dark:enabled:hover:bg-warning-500/30 [&>span>.loader]:text-warning-500",
      },
      {
        color: "danger",
        variant: "pastel",
        className:
          "bg-danger-500/10 text-danger-500 active:enabled:bg-danger-500/10 enabled:hover:bg-danger-500/20 dark:bg-danger-500/20 dark:active:enabled:bg-danger-500/10 dark:enabled:hover:bg-danger-500/30 [&>span>.loader]:text-danger-500",
      },
      {
        color: "default",
        variant: "outlined",
        className:
          "border border-muted-300 text-muted-500 hover:bg-white active:enabled:bg-muted-50 hover:enabled:bg-muted-100 hover:enabled:text-muted-600 dark:border-muted-700 dark:active:enabled:bg-muted-700 dark:hover:enabled:bg-muted-800 dark:hover:enabled:text-muted-100 [&>span>.loader]:text-muted-500 dark:[&>span>.loader]:text-muted-200",
      },
      {
        color: "contrast",
        variant: "outlined",
        className:
          "border border-muted-300 text-muted-500 hover:bg-white active:enabled:bg-muted-50 hover:enabled:bg-muted-100 hover:enabled:text-muted-600 dark:border-muted-700 dark:active:enabled:bg-muted-900 dark:hover:enabled:bg-muted-900 dark:hover:enabled:text-muted-100 [&>span>.loader]:text-muted-500 dark:[&>span>.loader]:text-muted-200",
      },
      {
        color: "muted",
        variant: "outlined",
        className:
          "border border-muted-300 text-muted-500 hover:bg-white active:enabled:bg-muted-50 hover:enabled:bg-muted-100 hover:enabled:text-muted-600 dark:border-muted-700 dark:active:enabled:bg-muted-700 dark:hover:enabled:bg-muted-800 dark:hover:enabled:text-muted-100 [&>span>.loader]:text-muted-500 dark:[&>span>.loader]:text-muted-200",
      },
      {
        color: "primary",
        variant: "outlined",
        className:
          "border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white active:enabled:bg-primary-400 [&>span>.loader]:text-primary-500",
      },
      {
        color: "info",
        variant: "outlined",
        className:
          "border border-info-500 text-info-500 hover:bg-info-500 hover:text-white active:enabled:bg-info-400 [&>span>.loader]:text-info-500",
      },
      {
        color: "success",
        variant: "outlined",
        className:
          "border border-success-500 text-success-500 hover:bg-success-500 hover:text-white active:enabled:bg-success-400",
      },
      {
        color: "warning",
        variant: "outlined",
        className:
          "border border-warning-500 text-warning-500 hover:bg-warning-500 hover:text-white active:enabled:bg-warning-400 [&>span>.loader]:text-warning-500",
      },
      {
        color: "danger",
        variant: "outlined",
        className:
          "border border-danger-500 text-danger-500 hover:bg-danger-500 hover:text-white active:enabled:bg-danger-400 [&>span>.loader]:text-danger-500",
      },
    ],

    defaultVariants: {
      color: "default",
      variant: "solid",
      shape: "smooth",
      shadow: "none",
    },
  }
);

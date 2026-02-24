import type { FC } from "react";

export interface ProgressProps {
  color?: "primary" | "info" | "success" | "warning" | "danger";
  contrast?: "default" | "contrast";
  shape?: "straight" | "rounded-sm" | "curved" | "full";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  value?: number;
  max?: number;
  classNames?: string | string[];
}

const Progress: FC<ProgressProps> = ({
  color = "primary",
  contrast = "default",
  shape = "full",
  size = "sm",
  value,
  max = 100,
  classNames,
}) => {
  return (
    <div
      aria-valuemax={max}
      aria-valuenow={value}
      className={`relative w-full overflow-hidden ${size === "xs" ? "h-1" : ""}
        ${size === "sm" ? "h-2" : ""}
        ${size === "md" ? "h-3" : ""}
        ${size === "lg" ? "h-4" : ""}
        ${size === "xl" ? "h-5" : ""}
        ${shape === "rounded-sm" ? "rounded-md" : ""}
        ${shape === "curved" ? "rounded-lg" : ""}
        ${shape === "full" ? "rounded-full" : ""}
        ${contrast === "default" ? "bg-muted-200 dark:bg-muted-700" : ""}
        ${contrast === "contrast" ? "bg-muted-200 dark:bg-muted-900" : ""}
        ${classNames}
      `}
      role="progressbar"
    >
      <div
        className={`absolute top-0 left-0 h-full transition-all duration-300 ${color === "primary" ? "bg-primary-500" : ""}
          ${color === "info" ? "bg-info-500" : ""}
          ${color === "success" ? "bg-success-500" : ""}
          ${color === "warning" ? "bg-warning-500" : ""}
          ${color === "danger" ? "bg-danger-500" : ""}
          ${shape === "rounded-sm" ? "rounded-md" : ""}
          ${shape === "curved" ? "rounded-lg" : ""}
          ${shape === "full" ? "rounded-full" : ""}
          ${value === undefined ? "w-full animate-indeterminate" : ""}
        `}
        style={{ width: value !== undefined ? `${value}%` : "" }}
      />
    </div>
  );
};

export default Progress;

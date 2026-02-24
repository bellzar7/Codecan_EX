import type { FC } from "react";

export interface ProgressProps {
  color?: "none" | "primary" | "info" | "success" | "warning" | "danger";
  contrast?: "default" | "contrast";
  size?: number;
  value?: number;
  max?: number;
  thickness?: number;
  classNames?: string | string[];
}

const Progress: FC<ProgressProps> = ({
  color = "none",
  contrast = "default",
  size = 60,
  value,
  max = 100,
  thickness = 4,
  classNames,
  ...props
}) => {
  return (
    <svg
      aria-valuemax={max}
      aria-valuenow={value}
      className={`block -rotate-90 ${classNames}`}
      height={size}
      role="progressbar"
      viewBox="0 0 45 45"
      width={size}
      {...props}
    >
      <circle
        className={`stroke-current text-muted-200 ${contrast === "default" ? "dark:text-muted-700" : ""}
          ${contrast === "contrast" ? "dark:text-muted-900" : ""}
        `}
        cx="50%"
        cy="50%"
        fill="none"
        r="15.91549431"
        strokeWidth={thickness}
      />
      <circle
        className={`stroke-current transition-all duration-500 ${color === "primary" ? "text-primary-500" : ""}
          ${color === "info" ? "text-info-500" : ""}
          ${color === "success" ? "text-success-500" : ""}
          ${color === "warning" ? "text-warning-500" : ""}
          ${color === "danger" ? "text-danger-500" : ""}
        `}
        cx="50%"
        cy="50%"
        fill="none"
        r="15.91549431"
        strokeDasharray={`${value},100`}
        strokeLinecap="round"
        strokeWidth={thickness}
      />
    </svg>
  );
};

export default Progress;

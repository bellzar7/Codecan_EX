import { Icon, type IconifyIcon } from "@iconify/react";
import type { VariantProps } from "class-variance-authority";
import { type FC, type InputHTMLAttributes, useEffect, useRef } from "react";
import Loader from "@/components/elements/base/loader/Loader";
import { colorInputVariants } from "@/components/elements/variants/input-variants";

interface ColorInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "color">,
    VariantProps<typeof colorInputVariants> {
  icon?: IconifyIcon | string;
  label?: string;
  addon?: string;
  error?: string;
  loading?: boolean;
  noPadding?: boolean;
  setFirstErrorInputRef?: (ref: HTMLInputElement) => void;
  warning?: boolean;
}

const ColorInput: FC<ColorInputProps> = ({
  label,
  addon,
  size = "md",
  color = "default",
  shape = "smooth",
  error,
  loading = false,
  icon,
  className: classes = "",
  noPadding = false,
  setFirstErrorInputRef,
  warning,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (setFirstErrorInputRef) {
      setFirstErrorInputRef(inputRef.current as HTMLInputElement);
    }
  }, [setFirstErrorInputRef, error]);

  return (
    <div className="w-full">
      {!!label && (
        <label className="font-sans text-[.68rem] text-muted-400">
          {label}
        </label>
      )}
      <div className={`relative w-full ${addon ? "flex" : ""}`}>
        {addon ? (
          <div
            className={`inline-flex cursor-pointer items-center justify-center border border-muted-200 border-e-transparent bg-muted-100 ${
              !noPadding && "px-4 py-2"
            } text-center text-muted-500 text-sm leading-tight dark:border-muted-800 dark:border-e-transparent dark:bg-muted-700 dark:text-muted-300 ${size === "sm" ? "h-8" : ""}
              ${size === "md" ? "h-10" : ""}
              ${size === "lg" ? "h-12" : ""}
              ${shape === "rounded-sm" ? "rounded-s-md" : ""}
              ${shape === "smooth" ? "rounded-s-lg" : ""}
              ${shape === "curved" ? "rounded-s-xl" : ""}
              ${shape === "full" ? "rounded-s-full" : ""}
            `}
          >
            {addon}
          </div>
        ) : (
          ""
        )}
        <input
          className={colorInputVariants({
            size,
            color,
            shape,
            className: `peer ${classes}
        ${size === "sm" && icon ? "ps-8 pe-1" : ""}
        ${size === "md" && icon ? "ps-10 pe-2" : ""}
        ${size === "lg" && icon ? "ps-12 pe-3" : ""}
        ${size === "sm" && !icon ? "px-1" : ""}
        ${size === "md" && !icon ? "px-2" : ""}
        ${size === "lg" && !icon ? "px-3" : ""}
        ${error ? "border-danger-500!" : ""}
        ${addon ? "rounded-s-none!" : ""}
        ${
          loading
            ? "select-none! pointer-events-none text-transparent! shadow-none! placeholder:text-transparent!"
            : ""
        }ring-1 ring-transparent focus:ring-${
          warning ? "warning" : "primary"
        }-500 focus:ring-opacity-50`,
          })}
          ref={inputRef}
          type="color"
          {...props}
        />

        {icon ? (
          <div
            className={`absolute top-0 left-0 z-0 flex items-center justify-center text-muted-400 transition-colors duration-300 peer-focus-visible:text-${
              warning ? "warning" : "primary"
            }-500 dark:text-muted-500 ${size === "sm" ? "h-9 w-9" : ""} 
              ${size === "md" ? "h-10 w-10" : ""} 
              ${size === "lg" ? "h-12 w-12" : ""}`}
          >
            <Icon
              className={`
                ${size === "sm" ? "h-4 w-4" : ""} 
                ${size === "md" ? "h-[14px] w-[14px]" : ""} 
                ${size === "lg" ? "h-6 w-6" : ""}
                ${error ? "text-danger-500!" : ""}
              `}
              icon={icon}
            />
          </div>
        ) : (
          ""
        )}
        {loading ? (
          <div
            className={`absolute top-0 right-0 z-0 flex items-center justify-center text-muted-400 transition-colors duration-300 peer-focus-visible:text-primary-500 dark:text-muted-500 ${size === "sm" ? "h-9 w-9" : ""} 
              ${size === "md" ? "h-10 w-10" : ""} 
              ${size === "lg" ? "h-12 w-12" : ""}`}
          >
            <Loader
              classNames={`dark:text-muted-200
                  ${
                    color === "muted" || color === "mutedContrast"
                      ? "text-muted-400"
                      : "text-muted-300"
                  }
                `}
              size={20}
              thickness={4}
            />
          </div>
        ) : (
          ""
        )}
        {error ? (
          <span className="mt-0.5 block font-sans text-[0.6rem] text-danger-500">
            {error}
          </span>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default ColorInput;

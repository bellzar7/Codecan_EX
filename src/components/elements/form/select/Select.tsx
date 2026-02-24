import { Icon, type IconifyIcon } from "@iconify/react";
import type { VariantProps } from "class-variance-authority";
import { type FC, type SelectHTMLAttributes, useEffect, useRef } from "react";
import Loader from "@/components/elements/base/loader/Loader";
import { selectVariants } from "@/components/elements/variants/select-variants";

interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size" | "color">,
    VariantProps<typeof selectVariants> {
  label?: string;
  icon?: IconifyIcon | string;
  error?: string;
  loading?: boolean;
  options: string[] | { label: string; value: string }[];
  containerClasses?: string;
  setFirstErrorInputRef?: (ref: HTMLInputElement) => void;
  onClose?: () => void;
}

const Select: FC<SelectProps> = ({
  label,
  options,
  icon,
  color = "default",
  shape,
  size = "md",
  error,
  loading = false,
  className: classes = "",
  containerClasses = "",
  onClose,
  setFirstErrorInputRef,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (setFirstErrorInputRef) {
      setFirstErrorInputRef(selectRef.current as unknown as HTMLInputElement);
    }
  }, [setFirstErrorInputRef, error]);

  const closeDropdown = () => {
    if (onClose) {
      onClose();
    }
  };

  if (!Array.isArray(options)) {
    throw new Error("options must be an array!");
  }

  const transformedOptions = options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option
  );

  return (
    <div className={`w-full font-sans ${containerClasses}`}>
      {!!label && (
        <label
          className={`"font-sans text-${
            size === "sm" ? "xs" : "sm"
          } text-muted-400 dark:text-muted-500"`}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <div
          className={`group relative inline-block w-full after:pointer-events-none after:absolute after:top-1/2 after:right-[.9em] after:z-4 after:block after:h-[.5em] after:w-[.5em] after:rounded-[2px] after:border-muted-400 after:border-s-[2.4px] after:border-b-[2.4px] after:transition-all after:duration-300 after:content-[''] after:[transform:scale(0.8)_rotate(-45deg)] focus-within:after:[transform:scale(0.8)_rotate(-225deg)] ${
            size === "sm"
              ? "after:-mt-[.366em] focus-within:after:top-[60%]"
              : ""
          }
            ${
              size === "md"
                ? "after:-mt-[.366em] focus-within:after:top-[60%]"
                : ""
            }
            ${
              size === "lg"
                ? "after:-mt-[.366em] focus-within:after:top-[60%]"
                : ""
            }
            ${loading ? "pointer-events-none after:border-transparent!" : ""}
        `}
          ref={inputRef}
        >
          <select
            className={selectVariants({
              size,
              color,
              shape,
              className: `peer ${classes}
                ${size === "sm" && icon ? "py-1! ps-8" : ""}
                ${size === "md" && icon ? "ps-10" : ""}
                ${size === "lg" && icon ? "ps-12" : ""}
                ${size === "sm" && !icon ? "py-1! ps-2" : ""}
                ${size === "md" && !icon ? "ps-3" : ""}
                ${size === "lg" && !icon ? "ps-4" : ""}
                ${error ? "border-danger-500!" : ""}
                ${loading ? "select-none! text-transparent! shadow-none!" : ""}
              `,
            })}
            onBlur={closeDropdown}
            ref={selectRef}
            {...props}
          >
            {transformedOptions.map((opt, i) => (
              <option key={i} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {icon ? (
          <div
            className={`absolute top-0 left-0 flex items-center justify-center text-muted-400 transition-colors duration-300 peer-focus-visible:text-primary-500 dark:text-muted-500 ${size === "sm" ? "h-8 w-8" : ""} 
            ${size === "md" ? "h-10 w-10" : ""} 
            ${size === "lg" ? "h-12 w-12" : ""}`}
          >
            <Icon
              className={`
              ${size === "sm" ? "h-3 w-3" : ""} 
              ${size === "md" ? "h-4 w-4" : ""} 
              ${size === "lg" ? "h-5 w-5" : ""}
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
            className={`absolute top-0 right-0 z-0 flex items-center justify-center text-muted-400 transition-colors duration-300 peer-focus-visible:text-primary-500 dark:text-muted-500 ${size === "sm" ? "h-8 w-8" : ""} 
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
          <span className="mt-0.5 block font-sans text-[0.48rem] text-danger-500">
            {error}
          </span>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default Select;

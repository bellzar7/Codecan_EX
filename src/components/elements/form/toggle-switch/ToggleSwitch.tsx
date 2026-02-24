import type { VariantProps } from "class-variance-authority";
import React, { type FC, useEffect, useRef } from "react";
import { toggleSwitchVariants } from "@/components/elements/variants/toggle-switch-variants";

interface ToggleSwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "color">,
    VariantProps<typeof toggleSwitchVariants> {
  checked?: boolean;
  label?: string;
  sublabel?: string;
  error?: string;
  setFirstErrorInputRef?: (ref: HTMLInputElement) => void;
}

const ToggleSwitch: FC<ToggleSwitchProps> = ({
  id,
  checked,
  label,
  sublabel,
  color,
  className: classes = "",
  error,
  setFirstErrorInputRef,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (setFirstErrorInputRef) {
      setFirstErrorInputRef(inputRef.current as HTMLInputElement);
    }
  }, [setFirstErrorInputRef, error]);

  return (
    <div className={`relative flex items-center gap-2 text-base ${classes}`}>
      <label
        className="relative inline-flex cursor-pointer items-center gap-3"
        htmlFor={id}
      >
        <span className="relative inline-flex">
          <input
            checked={checked}
            className={"peer pointer-events-none absolute opacity-0"}
            id={id}
            ref={inputRef}
            type="checkbox"
            {...props}
          />
          <i className={toggleSwitchVariants({ color })} />
        </span>

        {sublabel ? (
          <div className="ms-1">
            <span className="block font-sans text-muted-800 text-sm dark:text-muted-100">
              {label}
            </span>
            <span className="block font-sans text-muted-400 text-xs dark:text-muted-400">
              {sublabel}
            </span>
          </div>
        ) : (
          <span className="font-sans text-muted-400 text-sm">{label}</span>
        )}
      </label>
    </div>
  );
};

export default ToggleSwitch;

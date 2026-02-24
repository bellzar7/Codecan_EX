import { Icon } from "@iconify/react";
import type { VariantProps } from "class-variance-authority";
import type React from "react";
import type { FC } from "react";
import { radioVariants } from "@/components/elements/variants/radio-variants";

interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "color">,
    VariantProps<typeof radioVariants> {
  label: string;
}

const Radio: FC<RadioProps> = ({
  id,
  color,
  label,
  className: classes = "",
  ...props
}) => {
  // const radioId = label.toLocaleLowerCase().replaceAll(" ", "-");

  return (
    <div
      className={`radio-${
        color || "default"
      } relative inline-block cursor-pointer leading-tight`}
    >
      <label className="flex items-center" htmlFor={id}>
        <span className="relative flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full border border-muted-300 bg-muted-100 text-white transition-shadow duration-300 dark:border-muted-700 dark:bg-muted-800">
          <input
            className={`peer absolute top-0 left-0 z-3 h-full w-full cursor-pointer appearance-none ${classes}`}
            id={id}
            type="radio"
            {...props}
          />
          <Icon
            className={radioVariants({ color })}
            icon="octicon:dot-fill-24"
          />
          <span className="absolute top-0 left-0 z-1 block h-full w-full scale-0 rounded-full bg-white transition-transform duration-300 peer-checked:scale-[1.1] peer-checked:rounded-[.28rem] dark:bg-muted-900" />
        </span>
        <span className="ms-2 cursor-pointer text-[.72rem] text-muted-500 dark:text-muted-400">
          {label}
        </span>
      </label>
    </div>
  );
};

export default Radio;

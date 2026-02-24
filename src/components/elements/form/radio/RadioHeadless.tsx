import type React from "react";
import type { FC } from "react";

interface RadioHeadlessProps extends React.HTMLProps<HTMLInputElement> {
  id?: string;
  label?: string;
  name?: string;
  checked?: boolean;
  children?: React.ReactNode;
}

const RadioHeadless: FC<RadioHeadlessProps> = ({
  id,
  checked,
  label,
  name,
  children,
  ...props
}) => {
  return (
    <div className="group/radio-headless relative">
      {label ? (
        <label className="mb-1 inline-block cursor-pointer select-none font-sans text-muted-400 text-sm">
          {label}
        </label>
      ) : (
        ""
      )}
      <div className="relative">
        <input
          checked={checked}
          id={id}
          name={name}
          type="radio"
          {...props}
          className="peer absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
        />
        {children}
      </div>
    </div>
  );
};

export default RadioHeadless;

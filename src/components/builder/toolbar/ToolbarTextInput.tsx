import { useEffect, useState } from "react";

import { ChromePicker } from "react-color";

export interface ToolbarTextInputProps {
  prefix?: string;
  label?: string;
  type: string;
  onChange: (value: unknown) => void;
  value?: unknown;
}
export const ToolbarTextInput = ({
  onChange,
  value,
  prefix,
  label,
  type,
  ...props
}: ToolbarTextInputProps) => {
  const [internalValue, setInternalValue] = useState(value);
  const [active, setActive] = useState(false);
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  return (
    <div
      onClick={() => {
        setActive(true);
      }}
      style={{ width: "100%", position: "relative" }}
    >
      {(type === "color" || type === "bg") && active ? (
        <div
          className="absolute"
          style={{
            zIndex: 99_999,
            top: "calc(100% + 10px)",
            left: "-5%",
          }}
        >
          <div
            className="fixed top-0 left-0 h-full w-full cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActive(false);
            }}
          />
          <ChromePicker
            color={value}
            onChange={(color: { rgb: unknown }) => {
              onChange(color.rgb);
            }}
          />
        </div>
      ) : null}
      <input
        onChange={(e) => {
          setInternalValue(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onChange((e.target as HTMLInputElement).value);
          }
        }}
        style={{ margin: 0, width: "100%" }}
        value={String(internalValue || "")}
        {...props}
      />
    </div>
  );
};

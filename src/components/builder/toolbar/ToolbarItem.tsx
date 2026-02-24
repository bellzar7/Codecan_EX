import { useNode } from "@craftjs/core";
import type React from "react";
import { ToolbarDropdown } from "./ToolbarDropdown";
import { ToolbarTextInput } from "./ToolbarTextInput";

export interface ToolbarItemProps {
  prefix?: string;
  label?: string;
  full?: boolean;
  propKey: string;
  index: number;
  children?: React.ReactNode;
  type: string;
  onChange?: (value: unknown) => unknown;
}

export const ToolbarItem = ({
  full = false,
  propKey,
  type,
  onChange,
  index,
  ...props
}: ToolbarItemProps) => {
  const {
    actions: { setProp },
    propValue,
  } = useNode((node) => ({
    propValue: node.data.props[propKey],
  }));
  const value = Array.isArray(propValue) ? propValue[index] : propValue;

  return (
    <div style={{ display: "grid" }}>
      <div className="mb-2">
        {["text", "color", "bg", "number"].includes(type) ? (
          <ToolbarTextInput
            {...props}
            onChange={(value) => {
              setProp((props: Record<string, unknown>) => {
                if (Array.isArray(propValue)) {
                  (props[propKey] as any)[index] = onChange
                    ? onChange(value)
                    : value;
                } else {
                  props[propKey] = onChange ? onChange(value) : value;
                }
              }, 500);
            }}
            type={type}
            value={value}
          />
        ) : type === "slider" ? (
          <>
            {props.label ? (
              <h4 className="text-gray-400 text-sm">{props.label}</h4>
            ) : null}
            <div />
          </>
        ) : type === "radio" ? (
          <>
            {props.label ? (
              <h4 className="text-gray-400 text-sm">{props.label}</h4>
            ) : null}
            <input
              onChange={(e) => {
                const value = e.target.value;
                setProp((props: Record<string, unknown>) => {
                  props[propKey] = onChange ? onChange(value) : value;
                });
              }}
              type="radio"
              value={value || 0}
            />
          </>
        ) : type === "select" ? (
          <ToolbarDropdown
            onChange={(value: string) =>
              setProp(
                (props: Record<string, unknown>) =>
                  (props[propKey] = onChange ? onChange(value) : value)
              )
            }
            title={props.label || ""}
            value={value || ""}
          >
            {props.children}
          </ToolbarDropdown>
        ) : null}
      </div>
    </div>
  );
};

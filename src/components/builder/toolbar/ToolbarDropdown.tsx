import type React from "react";

interface ToolbarDropdownProps {
  title: string;
  value: string | number;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

export const ToolbarDropdown = ({
  title,
  value,
  onChange,
  children,
}: ToolbarDropdownProps) => {
  return (
    <div>
      <label>{title}</label>
      <select onChange={(e) => onChange(e.target.value)} value={value}>
        {children}
      </select>
    </div>
  );
};

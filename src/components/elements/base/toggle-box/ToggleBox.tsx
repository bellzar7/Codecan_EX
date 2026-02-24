import { Icon } from "@iconify/react";
import React, { type FC, useEffect, useRef, useState } from "react";

import Card from "@/components/elements/base/card/Card";

interface ToggleBoxProps {
  isToggle?: boolean;
  open?: boolean;
  title?: string;
  shape?: "straight" | "rounded-sm" | "smooth" | "curved";
  color?:
    | "default"
    | "contrast"
    | "muted"
    | "mutedContrast"
    | "primary"
    | "info"
    | "success"
    | "warning"
    | "danger";
  growOnExpand?: boolean;
  spaced?: boolean;
  header?: React.ReactNode;
  children: React.ReactNode;
}

const ToggleBox: FC<ToggleBoxProps> = ({
  header,
  children,
  title,
  shape = "smooth",
  color = "contrast",
  growOnExpand,
  spaced,
  isToggle = false,
  open = false,
}) => {
  const [panelOpened, setPanelOpened] = useState(open);

  useEffect(() => {
    setPanelOpened(open);
  }, [open]);

  const toggleBoxContentRef = useRef<HTMLDivElement>(null);

  return (
    <Card
      className={` 
        ${panelOpened && growOnExpand ? "md:p-6" : ""}
        ${spaced ? "p-6" : "p-4"}
      `}
      color={color}
      shadow={panelOpened ? "flat" : "none"}
      shape={shape}
    >
      <div
        className={`flex items-center justify-between ${
          panelOpened ? "" : ""
        } ${isToggle ? "cursor-pointer" : ""}`}
        onClick={() => {
          setPanelOpened(!panelOpened);
        }}
        role="button"
      >
        {header ? (
          <div>{header}</div>
        ) : (
          <div>
            <h5 className="font-medium font-sans text-muted-800 text-sm dark:text-muted-100">
              {title}
            </h5>
          </div>
        )}
        <div
          className={`pointer-events-none transition-all duration-300 ${
            panelOpened ? "rotate-90" : "hover:rotate-90"
          } ${
            isToggle
              ? "flex h-8 w-8 items-center justify-center rounded-full text-muted-400 hover:bg-muted-100 dark:hover:bg-muted-800 [&>svg]:h-4"
              : ""
          }`}
        >
          <Icon className="text-muted-400" icon="lucide:chevron-right" />
        </div>
      </div>
      <div
        className={`grid grid-cols-1 gap-4 overflow-hidden transition-all duration-300 ease-in-out ${
          panelOpened ? "mt-3" : "mt-0"
        }`}
        ref={toggleBoxContentRef}
        style={{
          maxHeight: panelOpened
            ? toggleBoxContentRef.current?.scrollHeight + "px"
            : "0px",
        }}
      >
        {children}
      </div>
    </Card>
  );
};

export default ToggleBox;

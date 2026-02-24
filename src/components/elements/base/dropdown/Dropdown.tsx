import { Icon, type IconifyIcon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import React, { type FC, useRef, useState } from "react";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import Button from "../button/Button";

interface DropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title?: string;
  toggleIcon?: string | IconifyIcon;
  toggleImage?: React.ReactNode;
  toggleButton?: React.ReactNode;
  indicator?: boolean;
  showAll?: string;
  toggleClassNames?: string;
  indicatorClasses?: string;
  orientation?: "start" | "end";
  shape?: "straight" | "rounded-sm" | "smooth" | "curved";
  toggleShape?: "straight" | "rounded-sm" | "smooth" | "curved";
  canRotate?: boolean;
  width?: number;
  color?:
    | "default"
    | "contrast"
    | "muted"
    | "primary"
    | "info"
    | "success"
    | "warning"
    | "danger"
    | undefined;
}
const Dropdown: FC<DropdownProps> = ({
  className: classes = "",
  children,
  title,
  toggleIcon,
  toggleImage,
  toggleButton,
  indicator = true,
  showAll,
  toggleClassNames = "",
  indicatorClasses = "",
  orientation = "start",
  shape = "smooth",
  toggleShape = "smooth",
  canRotate = false,
  color = "default",
}) => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(dropdownRef, () => setShow(false));
  return (
    <div
      className={`group relative text-start ${classes} ${show ? "active" : ""}`}
      ref={dropdownRef}
    >
      {indicator ? (
        <span
          className={`absolute top-0.5 right-0.5 z-2 block h-2 w-2 rounded-full bg-primary-500 ${indicatorClasses}`}
        />
      ) : (
        ""
      )}
      {toggleButton ? (
        <Button
          aria-label="Dropdown toggle"
          color={color}
          onClick={() => setShow(!show)}
          shape={toggleShape}
        >
          {toggleButton}
        </Button>
      ) : (
        <button
          aria-label="Dropdown toggle"
          className={`mask mask-blob flex h-10 w-10 cursor-pointer items-center justify-center transition-all duration-300 ${toggleClassNames} 
        ${canRotate && show ? "rotate-90" : "rotate-0"}`}
          onClick={() => setShow(!show)}
          type="button"
        >
          {toggleImage ? (
            <>{toggleImage}</>
          ) : (
            <Icon
              className="h-4 w-4 text-muted-500 transition-colors duration-300 group-hover:text-primary-500"
              icon={toggleIcon as IconifyIcon | string}
            />
          )}
        </button>
      )}
      <div
        className={`'] '] absolute top-[36px] z-5 min-w-[240px] before:content-[' after:content-[' ${
          shape !== "straight" && "rounded-xl"
        } border border-muted-200 bg-white shadow-lg shadow-muted-300/30 transition-all duration-300 before:pointer-events-none before:absolute before:bottom-full before:-ms-3 before:h-0 before:w-0 before:border-[9.6px] before:border-transparent before:border-b-muted-200 after:pointer-events-none after:absolute after:bottom-full after:-ms-[8.3px] after:h-0 after:w-0 after:border-[8.3px] after:border-transparent after:border-b-white dark:border-muted-800 dark:bg-muted-950 dark:shadow-muted-800/30 dark:after:border-b-muted-950 dark:before:border-b-muted-800 ${
          show
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-[4px] opacity-0"
        }
          ${
            orientation === "start"
              ? "-left-3 before:right-[85.5%] after:right-[86%]"
              : ""
          }
          ${
            orientation === "end"
              ? "-right-3 before:left-[90%] after:left-[90%]"
              : ""
          }
          ${shape === "rounded-sm" ? "rounded-md" : ""}
          ${shape === "smooth" ? "rounded-lg" : ""}
          ${shape === "curved" ? "rounded-xl" : ""}
        `}
      >
        <div className="relative h-full w-full">
          {title ? (
            <div className="flex items-center justify-between px-4 pt-3">
              <div className="font-light font-sans text-muted-400 text-xs uppercase tracking-wide">
                <span>{title}</span>
              </div>

              {showAll ? (
                <a
                  className="cursor-pointer font-sans font-semibold text-primary-500 text-xs underline-offset-4 hover:underline"
                  href={showAll}
                >
                  {t("View all")}
                </a>
              ) : (
                ""
              )}
            </div>
          ) : (
            ""
          )}
          <div
            className={`${title?.toLowerCase() + "-items"} ${
              title && "space-y-1 py-2"
            }`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dropdown;

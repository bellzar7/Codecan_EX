import { Icon, type IconifyIcon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import type React from "react";
import { type FC, type ReactNode, useEffect, useRef, useState } from "react";
import { navItemBaseStyles } from "./NavbarItem";

interface NavDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: IconifyIcon | string;
  title: string;
  children?: ReactNode;
  isActive?: boolean;
  nested?: boolean;
  description?: string;
}

const NavDropdown: FC<NavDropdownProps> = ({
  icon,
  title,
  children,
  className: classes = "",
  isActive = false,
  nested = false, // Defaults to false if not specified
  description,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Listen for clicks outside of the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <div
      className={`relative shrink-0 grow-0 items-stretch gap-1 lg:flex ${
        nested && isOpen ? "lg:relative" : ""
      }`}
      ref={dropdownRef}
    >
      <a
        className={`${navItemBaseStyles} relative flex w-full cursor-pointer items-center justify-between ${
          isOpen ? "bg-muted-100 text-primary-500 dark:bg-muted-800" : ""
        } ${isActive ? "rounded-none lg:rounded-lg" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <Icon className={"h-5 w-5"} icon={icon} />
          <div className="flex flex-col">
            <span className="text-sm">{t(title)}</span>
            {description && (
              <span className="text-muted-400 text-xs leading-none dark:text-muted-500">
                {t(description)}
              </span>
            )}
          </div>
        </div>
        <Icon
          className={`h-5 w-5 transition-transform ${
            isOpen
              ? nested
                ? "rotate-180 lg:rotate-[-90deg]"
                : "rotate-180"
              : nested
                ? "rotate-0 lg:rotate-90"
                : "rotate-0"
          }`}
          icon="mdi:chevron-down"
        />
      </a>
      <div
        className={`z-20 ${
          isOpen ? "block" : "hidden"
        } min-w-[220px] rounded-xl py-2 text-md shadow-lg transition-[opacity,transform] duration-100 lg:absolute ${
          nested ? "lg:top-0 lg:left-full" : "lg:top-full lg:left-0"
        } px-2 lg:border lg:border-muted-200 lg:bg-white lg:dark:border-muted-800 lg:dark:bg-muted-950 ${classes}`}
      >
        {children}
      </div>
    </div>
  );
};

export default NavDropdown;

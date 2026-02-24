import { Icon, type IconifyIcon } from "@iconify/react";
import Link from "next/link";
import type React from "react";
import type { FC } from "react";

interface ActionItemProps {
  href?: string;
  icon?: IconifyIcon | string;
  image?: React.ReactNode;
  text: string;
  subtext: string;
  shape?: "straight" | "rounded-sm" | "smooth" | "curved";
  blank?: boolean;
  onClick?: (item?) => void;
}

const ActionItem: FC<ActionItemProps> = ({
  href,
  icon,
  image,
  text,
  subtext,
  shape = "smooth",
  blank,
  onClick,
}) => {
  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    if (onClick && !href) {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <Link
      className={`group/option mx-2 flex cursor-pointer items-center gap-3 px-4 py-2 transition-colors duration-300 hover:bg-muted-100 dark:hover:bg-muted-800 ${shape === "rounded-sm" ? "rounded-md" : ""}
        ${shape === "smooth" ? "rounded-lg" : ""}
        ${shape === "curved" ? "rounded-xl" : ""}
        ${href ? "" : "role='button'"}`}
      href={href || "#"}
      onClick={handleClick}
      target={blank ? "_blank" : "_self"}
    >
      {image || null}
      {icon ? (
        <Icon
          className="h-5 w-5 text-muted-400 transition-colors duration-300 group-hover:option:text-primary-500"
          icon={icon}
        />
      ) : null}
      <div className="font-sans">
        <span className="block cursor-pointer font-normal text-muted-800 text-xs leading-tight dark:text-muted-100">
          {text}
        </span>
        <span className="block text-muted-400 text-xs leading-tight">
          {subtext}
        </span>
      </div>
    </Link>
  );
};

export default ActionItem;

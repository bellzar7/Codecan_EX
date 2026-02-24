import { Icon } from "@iconify/react";
import LogoText from "@/components/vector/LogoText";
import { cn } from "@/utils/cn";
import type { TopBarProps } from "./TopBar.types";

const TopBarBase = ({
  collapse,
  sidebarOpened,
  setIsSidebarOpenedMobile,
  collapseSidebarToggle,
}: TopBarProps) => {
  const containerClasses = cn(
    "flex h-16 min-h-[64px] items-center justify-between border-b px-6",
    {
      "border-primary-700": collapse,
      "border-muted-200 dark:border-muted-800": !collapse,
    }
  );

  const logoTextClasses = cn("max-w-[110px]", {
    "text-white": collapse,
    "text-muted-900 dark:text-white": !collapse,
    "lg:hidden": !sidebarOpened,
  });

  const collapseButtonClasses = cn(
    "mask mask-blob hidden h-10 w-10 items-center justify-center transition-all duration-300 lg:flex",
    {
      "cursor-pointer hover:bg-primary-700": collapse,
      "text-muted-400 hover:bg-muted-100 dark:text-muted-100 dark:hover:bg-muted-800":
        !collapse,
      "rotate-180": !sidebarOpened,
    }
  );

  const collapseIconClasses = cn({
    "h-4 w-4 text-muted-100": collapse,
    "h-5 w-5": !collapse,
  });

  const mobileButtonClasses = cn(
    "flex h-10 w-10 items-center justify-center duration-300 lg:hidden",
    {
      "cursor-pointer transition-transform": collapse,
      "transition-colors": !collapse,
    }
  );

  const mobileIconClasses = cn({
    "h-4 w-4 text-muted-100": collapse,
    "h-5 w-5 text-muted-400": !collapse,
  });

  return (
    <div className={containerClasses}>
      <LogoText className={logoTextClasses} />
      <button
        className={collapseButtonClasses}
        onClick={collapseSidebarToggle}
        type="button"
      >
        <Icon className={collapseIconClasses} icon="lucide:arrow-left" />
      </button>
      <button
        className={mobileButtonClasses}
        onClick={() => setIsSidebarOpenedMobile(false)}
        type="button"
      >
        <Icon className={mobileIconClasses} icon="lucide:arrow-left" />
      </button>
    </div>
  );
};

export const TopBar = TopBarBase;

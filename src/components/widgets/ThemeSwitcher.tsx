import { Icon } from "@iconify/react";
import type React from "react";
import type { FC } from "react";
import { useDashboardStore } from "@/stores/dashboard";

interface ThemeSwitcherProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const ThemeSwitcher: FC<ThemeSwitcherProps> = ({ className: classes = "" }) => {
  const { toggleTheme, isDark, settings } = useDashboardStore();
  if (settings?.themeSwitcher === "false") return null;

  return (
    <label
      className={`mask mask-blob relative block overflow-hidden ${classes}`}
    >
      <input
        aria-label="Toggle theme"
        checked={isDark}
        className="peer absolute top-0 left-0 z-2 h-full w-full cursor-pointer opacity-0"
        onChange={() => {}}
        onClick={() => toggleTheme()}
        type="checkbox"
      />
      <span className="relative block h-10 w-10 bg-white text-lg dark:bg-muted-800 [&>.moon-icon]:peer-checked:opacity-100 [&>.moon-icon]:peer-checked:[transform:translate(-45%,-50%)] [&>.sun-icon]:peer-checked:opacity-0 [&>.sun-icon]:peer-checked:[transform:translate(-45%,-150%)]">
        <Icon
          className="sun-icon pointer-events-none absolute top-1/2 left-1/2 block -translate-x-[48%] -translate-y-[50%] text-yellow-400 opacity-100 transition-all duration-300 *:fill-yellow-400"
          icon="lucide:sun"
        />
        <Icon
          className="moon-icon pointer-events-none absolute top-1/2 left-1/2 block text-yellow opacity-0 transition-all duration-300 *:fill-yellow-400"
          icon="material-symbols:dark-mode"
        />
      </span>
    </label>
  );
};

export default ThemeSwitcher;

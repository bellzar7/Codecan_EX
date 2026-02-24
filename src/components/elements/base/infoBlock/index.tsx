import { Icon, type IconifyIcon } from "@iconify/react";
import type React from "react";
import type { FC } from "react";

const InfoBlock: FC<{
  icon: IconifyIcon | string;
  label: string;
  value: string | React.ReactNode;
  isAdd?: boolean;
}> = ({ icon, label, value, isAdd }) => {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${
          isAdd
            ? "cursor-pointer text-muted-400 hover:bg-primary-500 hover:text-muted-100 hover:shadow-lg hover:shadow-muted-300/30 dark:hover:shadow-muted-800/20"
            : "text-muted-400"
        }`}
      >
        <Icon className="h-5 w-5 transition-all duration-300" icon={icon} />
      </div>
      <div className="font-sans">
        <span className="block font-semibold text-muted-800 text-xs dark:text-muted-100">
          {label}
        </span>
        <span className="block text-muted-400 text-sm">{value}</span>
      </div>
    </div>
  );
};

export default InfoBlock;

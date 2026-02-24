import { memo } from "react";

const PercentageBarBase = ({ askPercentage, bidPercentage }) => {
  return (
    <div className="w-full">
      <div className="relative flex h-6 w-full items-center">
        <div
          className="flex h-full items-center justify-start rounded-l-sm bg-success-600 pl-1 text-left text-white transition-all duration-300 ease-in-out"
          style={{
            width: `${bidPercentage}%`,
            clipPath: "polygon(0 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
          }}
        >
          <span className="py mr-2 cursor-default rounded-xs bg-muted-100 px-[4px] text-muted-800 dark:bg-muted-900 dark:text-muted-200">
            B
          </span>
          <span className="z-1 cursor-default text-sm">{bidPercentage}%</span>
        </div>
        <div
          className="flex h-full items-center justify-end rounded-r-sm bg-danger-500 pr-1 text-right text-white transition-all duration-300 ease-in-out"
          style={{
            width: `${askPercentage}%`,
            clipPath: "polygon(3px 0, 100% 0, 100% 100%, 0 100%)",
          }}
        >
          <span className="z-1 cursor-default text-sm">{askPercentage}%</span>
          <span className="py ms-2 cursor-default rounded-xs bg-muted-100 px-[4px] text-muted-800 dark:bg-muted-900 dark:text-muted-200">
            S
          </span>
        </div>
      </div>
    </div>
  );
};

export const PercentageBar = memo(PercentageBarBase);

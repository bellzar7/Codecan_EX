import type React from "react";
import type { FC } from "react";
import CircleChartWidget from "./CircleChartWidget";

interface CircleWidgetProps {
  icon: string | React.ReactNode;
  circleColor?: keyof CircleColors;
  circlePercentage?: number;
  title: string;
  text: string;
}

const CircleWidget: FC<CircleWidgetProps> = ({
  title,
  text,
  icon,
  circleColor = "primary",
  circlePercentage = 84,
}) => {
  return (
    <div className="flex w-full items-center rounded-lg border border-muted-200 bg-white p-5 dark:border-muted-800 dark:bg-muted-900">
      <CircleChartWidget
        circleColor={circleColor}
        circlePercentage={circlePercentage}
        height={70}
        width={70}
      >
        {typeof icon === "string" ? (
          <span className="inner-text text-center font-medium text-muted-800 dark:text-muted-100">
            {icon}
          </span>
        ) : (
          icon
        )}
      </CircleChartWidget>
      <div className="circle-meta ms-6">
        <h3 className="font-normal font-sans text-base text-muted-800 dark:text-muted-100">
          {title}
        </h3>
        <p className="max-w-xs text-muted-400 text-xs">{text}</p>
      </div>
    </div>
  );
};

export default CircleWidget;

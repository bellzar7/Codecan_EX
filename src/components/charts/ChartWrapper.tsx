import type { FC } from "react";
import Card from "@/components/elements/base/card/Card";

interface ChartWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  label: string;
}
const ChartWrapper: FC<ChartWrapperProps> = ({
  children,
  label,
  className: classes = "",
}) => (
  <div className={`w-full ${classes}`}>
    <Card className="p-4" color="contrast" shape="smooth">
      <div className="p-4">
        <h3 className="font-medium font-sans text-base text-muted-800 leading-tight dark:text-muted-100">
          {label}
        </h3>
      </div>
      {children}
    </Card>
  </div>
);

export default ChartWrapper;

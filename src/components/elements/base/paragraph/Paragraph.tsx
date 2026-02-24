import { memo } from "react";
import { cn } from "@/utils/cn";

type ParagraphProps = {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  children: React.ReactNode;
};

const Paragraph: React.FC<ParagraphProps> = ({
  size = "md",
  className,
  children,
}) => {
  const classes = cn(
    {
      "text-xs": size === "xs",
      "text-sm": size === "sm",
      "text-md": size === "md",
      "text-lg": size === "lg",
      "text-xl": size === "xl",
    },
    className
  );

  return <p className={classes}>{children}</p>;
};

export default memo(Paragraph);

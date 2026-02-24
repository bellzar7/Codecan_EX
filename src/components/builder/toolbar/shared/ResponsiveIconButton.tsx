import { Icon } from "@iconify/react";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import { Tooltip } from "@/components/elements/base/tooltips/Tooltip";

const ResponsiveIconButton = ({
  breakpoint,
  isActive,
  hasClasses,
  onClick,
}) => (
  <Tooltip content={breakpoint.toUpperCase()} position="bottom">
    <div className="relative">
      <IconButton
        color={isActive ? "primary" : "muted"}
        onClick={onClick}
        shape="rounded-xs"
        size="xs"
        variant="outlined"
      >
        <Icon
          className="h-4 w-4"
          icon={`mdi:${
            breakpoint === "xs"
              ? "cellphone"
              : breakpoint === "sm"
                ? "tablet"
                : breakpoint === "md"
                  ? "laptop"
                  : breakpoint === "lg"
                    ? "desktop-classic"
                    : "monitor"
          }`}
        />
      </IconButton>
      {hasClasses && (
        <span className="absolute top-0 -right-[2px] h-[5px] w-[5px] rounded-full bg-warning-500" />
      )}
    </div>
  </Tooltip>
);

export default ResponsiveIconButton;

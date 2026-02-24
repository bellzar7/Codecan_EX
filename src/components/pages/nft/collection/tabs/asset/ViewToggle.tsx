import { Icon } from "@iconify/react";
import type React from "react";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import { Tooltip } from "@/components/elements/base/tooltips/Tooltip";

interface ViewToggleProps {
  viewMode: "list" | "grid";
  setViewMode: (mode: "list" | "grid") => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, setViewMode }) => {
  return (
    <div className="flex items-center gap-2 border-muted-200 border-s ps-4 dark:border-muted-800">
      <Tooltip content="List View">
        <IconButton
          color={viewMode === "list" ? "purple" : "muted"}
          onClick={() => setViewMode("list")}
        >
          <Icon icon="stash:list-ul" />
        </IconButton>
      </Tooltip>

      <Tooltip content="Grid View">
        <IconButton
          color={viewMode === "grid" ? "purple" : "muted"}
          onClick={() => setViewMode("grid")}
        >
          <Icon icon="bitcoin-icons:grid-filled" />
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default ViewToggle;

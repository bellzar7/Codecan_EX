import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { capitalize } from "lodash";
import type React from "react";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import useBuilderStore from "@/stores/admin/builder";
import { Toolbar } from "../../toolbar";
import Blocks from "../Menu/Blocks";

const BuilderMenu: React.FC = () => {
  const { sidebar, setSidebar } = useBuilderStore();

  return (
    <motion.div
      animate={{ width: sidebar ? 240 : 0 }}
      className="h-full overflow-hidden bg-muted-200 dark:bg-muted-850"
      initial={{ width: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between border-muted-300 border-b bg-muted-50 p-4 dark:border-muted-800 dark:bg-muted-950">
        <div className="text-muted-800 dark:text-muted-400">
          {capitalize(sidebar)}
        </div>

        <IconButton
          onClick={() => {
            setSidebar("");
          }}
          shape="full"
          size="sm"
        >
          <Icon className="h-4 w-4" icon="lucide:x" />
        </IconButton>
      </div>
      <div className="slimscroll h-[calc(100%_-_50px)] overflow-y-auto">
        {/* {sidebar === "ELEMENTS" && <Elements />} */}
        {sidebar === "BLOCKS" && <Blocks />}
        {sidebar === "TOOLBAR" && <Toolbar />}
      </div>
    </motion.div>
  );
};

export default BuilderMenu;

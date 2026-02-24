// src/components/Sidebar/Category.tsx

import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import type React from "react";

interface CategoryProps {
  title: string;
  height?: string;
  children: React.ReactNode;
  visible: boolean;
  setVisible: () => void;
}

const Category: React.FC<CategoryProps> = ({
  title,
  height,
  children,
  visible,
  setVisible,
}) => {
  return (
    <div className="flex flex-col text-muted-800 dark:text-muted-200">
      <div
        className="flex cursor-pointer items-center border-muted-300 border-b p-2 px-4 dark:border-muted-600"
        onClick={setVisible}
      >
        <h2 className="text-xs uppercase">{title}</h2>
        <Icon
          className={`ml-auto h-4 w-4 transition-transform ${
            visible ? "rotate-180" : "rotate-0"
          }`}
          icon="akar-icons:chevron-down"
        />
      </div>
      {visible && (
        <motion.div
          animate={{ height: height || "auto" }}
          className="overflow-auto"
          initial={{ height: 0 }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
};

export default Category;

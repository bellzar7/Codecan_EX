import { useNode } from "@craftjs/core";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import type React from "react";
import { useState } from "react";
import { cn } from "@/utils/cn";

interface ToolbarSectionProps {
  title: string;
  props?: string[];
  summary?: (props: Record<string, unknown>) => string;
  children: React.ReactNode;
}

export const ToolbarSection = ({
  title,
  props,
  summary,
  children,
}: ToolbarSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { nodeProps } = useNode((node) => ({
    nodeProps: props?.reduce((res: Record<string, unknown>, key: string) => {
      res[key] = node.data.props[key] || null;
      return res;
    }, {}),
  }));

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="text-muted-800 dark:text-muted-200">
      <div
        className={cn(
          "flex cursor-pointer items-center justify-between px-2 py-2",
          "border-muted-300 border-b dark:border-muted-700"
        )}
        onClick={handleToggle}
      >
        <div className="flex items-center space-x-4">
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Icon
              className="h-4 w-4 dark:text-muted-400"
              icon={"mdi:chevron-right"}
            />
          </motion.div>
          <h5 className="font-medium text-muted-800 text-sm dark:text-muted-300">
            {title}
          </h5>
        </div>
        {summary && props && nodeProps ? (
          <h5 className="text-right text-blue-800 text-sm dark:text-muted-300">
            {summary(
              props.reduce((acc: Record<string, unknown>, key: string) => {
                acc[key] = nodeProps[key];
                return acc;
              }, {})
            )}
          </h5>
        ) : null}
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            animate={{ height: "auto", opacity: 1 }}
            className="overflow-hidden"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-wrap bg-muted-100 p-2 shadow-inner dark:bg-muted-900">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ToolbarSection;

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Checkbox from "@/components/elements/form/checkbox/Checkbox";
import { useDashboardStore } from "@/stores/dashboard";
import type { LoadingRowProps } from "./LoadingRow.types";

const LoadingRowBase = ({
  columnConfig,
  canDelete,
  isCrud,
  hasActions,
}: LoadingRowProps) => {
  const { isDark } = useDashboardStore();
  const [skeletonProps, setSkeletonProps] = useState({
    baseColor: "#f7fafc",
    highlightColor: "#edf2f7",
  });

  useEffect(() => {
    setSkeletonProps({
      baseColor: isDark ? "#27272a" : "#f7fafc",
      highlightColor: isDark ? "#3a3a3e" : "#edf2f7",
    });
  }, [isDark]);

  const renderSkeleton = (type, hasImage) => {
    if (hasImage) {
      return (
        <div className="flex items-center gap-2 pl-4">
          <Skeleton circle height={25.6} width={25.6} {...skeletonProps} />
          <Skeleton height={9.6} width={48} {...skeletonProps} />
        </div>
      );
    }

    switch (type) {
      case "switch":
        return (
          <Skeleton
            borderRadius={40}
            height={20.8}
            width={36.8}
            {...skeletonProps}
          />
        );
      case "select":
        return (
          <Skeleton
            borderRadius={6.4}
            height={22.4}
            width={64}
            {...skeletonProps}
          />
        );
      default:
        return (
          <span className="line-clamp-1 text-sm">
            <Skeleton height={12} width="100%" {...skeletonProps} />
          </span>
        );
    }
  };

  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <motion.tr
          animate={{ opacity: 1, x: 0 }}
          className="h-16 border-muted-200 border-b transition-colors duration-300 last:border-none hover:bg-muted-200/40 dark:border-muted-800 dark:hover:bg-muted-900/60"
          exit={{ opacity: 0, x: 2 }}
          initial={{ opacity: 0, x: -2 }}
          key={index}
          transition={{ duration: 0.2 }}
        >
          {canDelete && isCrud && (
            <td className="px-4 pt-2">
              <Checkbox className="cursor-pointer" color="primary" />
            </td>
          )}
          {columnConfig.map(({ field, type, hasImage }) => (
            <td className="px-4 py-3 align-middle" key={field}>
              {renderSkeleton(type, hasImage)}
            </td>
          ))}
          {hasActions && (
            <td className="px-4 py-3 align-middle">
              <div className="flex w-full justify-end">
                <Skeleton circle height={32} width={32} {...skeletonProps} />
              </div>
            </td>
          )}
        </motion.tr>
      ))}
    </>
  );
};

export const LoadingRow = LoadingRowBase;

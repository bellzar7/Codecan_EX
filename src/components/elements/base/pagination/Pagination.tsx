import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import type { FC } from "react";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import { DOTS, usePagination } from "@/hooks/usePagination";

interface PaginationProps {
  onPageChange: (page: number) => void;
  totalCount: number;
  siblingCount?: number;
  currentPage: number;
  pageSize: number;
  buttonSize?: "sm" | "md" | "lg";
  buttonShape?: "straight" | "rounded-sm" | "smooth" | "curved" | "full";
}
const Pagination: FC<PaginationProps> = ({
  onPageChange,
  totalCount,
  siblingCount = 0,
  currentPage,
  pageSize,
  buttonSize = "md",
  buttonShape = "smooth",
}) => {
  const { t } = useTranslation();
  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  });
  // If there are less than 2 times in pagination range we shall not render the component
  if (
    currentPage === 0 ||
    (paginationRange !== undefined && paginationRange.length < 2)
  ) {
    return (
      <div className="flex justify-center gap-1 px-4 font-medium text-gray-500 text-sm dark:text-gray-400">
        <span>
          {t("Showing all records")} ({totalCount})
        </span>
      </div>
    );
  }
  const onNext = () => {
    onPageChange(currentPage + 1);
  };
  const onPrevious = () => {
    onPageChange(currentPage - 1);
  };
  const lastPage =
    paginationRange !== undefined
      ? paginationRange[paginationRange.length - 1]
      : 0;
  return (
    <ul className="flex justify-center gap-1 font-medium text-sm">
      {/* Left navigation arrow */}
      <li>
        <IconButton
          className="rtl:rotate-180"
          disabled={currentPage === 1}
          onClick={onPrevious}
          shape={buttonShape}
          size={buttonSize}
          type="button"
        >
          <span className="sr-only">{t("Prev Page")}</span>
          <Icon className="h-4 w-4 scale-95" icon="lucide:arrow-left" />
        </IconButton>
      </li>
      {paginationRange?.map((pageNumber: any, index) => {
        // If the pageItem is a DOT, render the DOTS unicode character
        if (pageNumber === DOTS) {
          return (
            <li className="pagination-item dots" key={index}>
              <IconButton shape={buttonShape} size={buttonSize} type="button">
                <Icon className="h-4 w-4" icon="lucide:more-horizontal" />
              </IconButton>
            </li>
          );
        }
        // Render our Page Pills
        return (
          <li key={index}>
            <IconButton
              color={pageNumber === currentPage ? "primary" : "default"}
              onClick={() => onPageChange(pageNumber)}
              shape={buttonShape}
              size={buttonSize}
              type="button"
            >
              <span>{pageNumber}</span>
            </IconButton>
          </li>
        );
      })}
      {/*  Right Navigation arrow */}
      <li>
        <IconButton
          className="rtl:rotate-180"
          disabled={currentPage === lastPage}
          onClick={onNext}
          shape={buttonShape}
          size={buttonSize}
          type="button"
        >
          <span className="sr-only">{t("Prev Page")}</span>
          <Icon className="h-4 w-4 scale-95" icon="lucide:arrow-right" />
        </IconButton>
      </li>
    </ul>
  );
};
export default Pagination;

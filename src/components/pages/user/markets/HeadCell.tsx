import type { FC } from "react";

interface HeadCellProps {
  label?: string;
  sortFn: (field: string, rule: "asc" | "desc") => void;
  sortField: string;
  sorted: { field: string; rule: "asc" | "desc" };
  sortable?: boolean;
}

const HeadCell: FC<HeadCellProps> = ({
  label,
  sortFn,
  sortField,
  sorted,
  sortable = true,
}) => {
  const isSorted = sorted.field === sortField;

  return (
    <div className="flex items-center justify-between gap-4 font-sans">
      {label && (
        <span className="font-medium text-muted-400 text-xs uppercase dark:text-muted-500">
          {label}
        </span>
      )}
      {sortable && (
        <div className="flex flex-col">
          <svg
            className={`h-2.5 w-2.5 cursor-pointer fill-none ${
              sorted.rule === "asc" && isSorted
                ? "text-primary-500"
                : "text-muted-400"
            }`}
            fill="none"
            onClick={() => sortFn(sortField, "asc")}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                sortFn(sortField, "asc");
              }
            }}
            role="button"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
            tabIndex={0}
            viewBox="0 0 24 24"
          >
            <path d="M5 15l7-7 7 7" />
          </svg>
          <svg
            className={`h-2.5 w-2.5 cursor-pointer fill-none ${
              sorted.rule === "desc" && isSorted
                ? "text-primary-500"
                : "text-muted-400"
            }`}
            fill="none"
            onClick={() => sortFn(sortField, "desc")}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                sortFn(sortField, "desc");
              }
            }}
            role="button"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
            tabIndex={0}
            viewBox="0 0 24 24"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default HeadCell;

import { memo } from "react";

interface SortableHeaderProps {
  field: string; // Single field passed as a parameter
  title?: string; // Single title passed as a parameter
  setSort: (sort: { field: string; rule: "asc" | "desc" }) => void;
  sort: { field: string; rule: "asc" | "desc" };
  className?: string;
  size?: string;
}

const SortableHeaderBase = ({
  field,
  title,
  setSort,
  sort,
  className,
  size = "xs",
}: SortableHeaderProps) => {
  const isSorted = (field: string) => sort.field === field;

  return (
    <div
      className={`flex cursor-pointer flex-row items-center text-${size} gap-1 ${className}`}
      onClick={() =>
        setSort({
          field,
          rule: sort.rule === "asc" && isSorted(field) ? "desc" : "asc",
        })
      }
    >
      {title ? title : field.charAt(0).toUpperCase() + field.slice(1)}{" "}
      {/* Capitalize the first letter */}
      <div className="flex flex-col items-center">
        <svg
          className={`h-2 w-2 cursor-pointer fill-none ${
            sort.rule === "asc" && isSorted(field)
              ? "text-warning-500"
              : "text-muted-400"
          }`}
          fill="none"
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
          className={`h-2 w-2 cursor-pointer fill-none ${
            sort.rule === "desc" && isSorted(field)
              ? "text-warning-500"
              : "text-muted-400"
          }`}
          fill="none"
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
    </div>
  );
};

export const SortableHeader = memo(SortableHeaderBase);

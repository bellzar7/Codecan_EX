import type React from "react";
import { SortableHeader } from "@/components/pages/trade/markets/SortableHeader";

interface AssetTableHeaderProps {
  sortState: { field: string; rule: "asc" | "desc" };
  setSortState: (sort: { field: string; rule: "asc" | "desc" }) => void;
}

const AssetTableHeader: React.FC<AssetTableHeaderProps> = ({
  sortState,
  setSortState,
}) => (
  <div className="mb-1 grid grid-cols-5 gap-4 rounded-lg bg-muted-150 py-3 text-muted-400 text-sm dark:bg-muted-900">
    <SortableHeader
      className="col-span-2 ps-4 text-muted-700 dark:text-muted-200"
      field="index"
      setSort={setSortState}
      size="sm"
      sort={sortState}
      title="Item"
    />
    <SortableHeader
      className="text-muted-700 dark:text-muted-200"
      field="price"
      setSort={setSortState}
      size="sm"
      sort={sortState}
      title="Price"
    />
    <span className="text-muted-700 dark:text-muted-200">Owner</span>
    <SortableHeader
      className="text-muted-700 dark:text-muted-200"
      field="createdAt"
      setSort={setSortState}
      size="sm"
      sort={sortState}
      title="Listed Time"
    />
  </div>
);

export default AssetTableHeader;

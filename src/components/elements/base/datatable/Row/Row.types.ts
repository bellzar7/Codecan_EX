import type { ReactNode } from "react";

export interface RowProps {
  item: Record<string, unknown>;
  columnConfig: ColumnConfigType[];
  dropdownActionsSlot?: (item: Record<string, unknown>) => ReactNode;
  canDelete?: boolean;
  isParanoid?: boolean;
  hasActions?: boolean;
  viewPath?: string;
  editPath?: string;
  blank?: boolean;
}

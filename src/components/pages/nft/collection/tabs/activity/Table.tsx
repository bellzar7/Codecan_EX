import { formatDistanceToNow } from "date-fns";
import type React from "react";
import { SortableHeader } from "@/components/pages/trade/markets/SortableHeader";
import { useNftStore } from "@/stores/nft";

interface ActivityTableProps {
  type: "collection" | "asset";
  activities: any[];
  sortState: { field: string; rule: "asc" | "desc" };
  setSortState: (sort: { field: string; rule: "asc" | "desc" }) => void;
}

const ActivityTable: React.FC<ActivityTableProps> = ({
  type,
  activities,
  sortState,
  setSortState,
}) => {
  const { collection } = useNftStore();
  if (!collection) return null;

  return (
    <div className="w-full text-muted-300">
      {/* Table Header with Sorting Options */}
      <div
        className={`grid ${
          type === "collection" ? "grid-cols-6" : "grid-cols-5"
        } mb-1 gap-4 rounded-lg bg-muted-150 py-3 text-muted-400 text-sm dark:bg-muted-900`}
      >
        <SortableHeader
          className="ps-4 text-muted-700 dark:text-muted-200"
          field="type"
          setSort={setSortState}
          size="sm"
          sort={sortState}
          title="Event Type"
        />
        {type === "collection" && (
          <SortableHeader
            className="text-muted-700 dark:text-muted-200"
            field="item"
            setSort={setSortState}
            size="sm"
            sort={sortState}
            title="Item"
          />
        )}
        <SortableHeader
          className="text-muted-700 dark:text-muted-200"
          field="price"
          setSort={setSortState}
          size="sm"
          sort={sortState}
          title="Value"
        />
        <SortableHeader
          className="text-muted-700 dark:text-muted-200"
          field="from"
          setSort={setSortState}
          size="sm"
          sort={sortState}
          title="From"
        />
        <SortableHeader
          className="text-muted-700 dark:text-muted-200"
          field="to"
          setSort={setSortState}
          size="sm"
          sort={sortState}
          title="To"
        />
        <SortableHeader
          className="text-muted-700 dark:text-muted-200"
          field="createdAt"
          setSort={setSortState}
          size="sm"
          sort={sortState}
          title="Time"
        />
      </div>

      {/* Activity Rows */}
      {activities.length === 0 ? (
        <div className="py-4 text-center">
          No activities found for this collection.
        </div>
      ) : (
        activities.map((activity, index) => (
          <div
            className={`grid ${
              type === "collection" ? "grid-cols-6" : "grid-cols-5"
            } cursor-pointer items-center gap-4 border-muted-200 border-b py-3 transition hover:bg-muted-100 dark:border-muted-800 dark:hover:bg-muted-800`}
            key={index}
          >
            {/* Type Column */}
            <div className="flex items-center ps-4">
              <span
                className={`rounded-md px-2 py-1 font-medium text-xs ${getBadgeStyle(
                  activity.type
                )}`}
              >
                {activity.type.replace("nft", "")}
              </span>
            </div>

            {/* Item Info */}
            {type === "collection" && (
              <div className="flex items-center">
                <img
                  alt="activity image"
                  className="mr-4 h-20 w-20 rounded-md"
                  src={activity.image || "/img/avatars/placeholder.webp"}
                />
                <span className="font-semibold text-lg text-muted-800 dark:text-muted-200">
                  {activity.nftAsset?.name || "N/A"}
                </span>
              </div>
            )}

            {/* Value */}
            <span className="text-muted-700 dark:text-muted-200">
              {activity.price ? `${activity.price} ${collection.chain}` : "-"}
            </span>

            {/* From */}
            <span className="text-purple-500">
              {activity.seller ? `@${activity.seller.firstName}` : "-"}
            </span>

            {/* To */}
            <span className="text-warning-500">
              {activity.buyer ? `@${activity.buyer.firstName}` : "-"}
            </span>

            {/* Time (Relative Time Ago) */}
            <span className="text-muted-500 dark:text-muted-400">
              {formatDistanceToNow(new Date(activity.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

/**
 * Function to determine badge styles for different activity types
 */
const getBadgeStyle = (type: string) => {
  switch (type.toLowerCase()) {
    case "nfttransaction":
      return "bg-green-200 dark:bg-green-700 text-green-700 dark:text-green-200";
    case "nftbid":
      return "bg-blue-200 dark:bg-blue-700 text-blue-700 dark:text-blue-200";
    default:
      return "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200";
  }
};

export default ActivityTable;

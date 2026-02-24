import { Icon } from "@iconify/react";
import type React from "react";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import { Tooltip } from "@/components/elements/base/tooltips/Tooltip";
import Input from "@/components/elements/form/input/Input";
import Select from "@/components/elements/form/select/Select";

interface ActivityFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  activityType: string;
  setActivityType: (value: string) => void;
  minValue: number | undefined;
  setMinValue: (value: number | undefined) => void;
  maxValue: number | undefined;
  setMaxValue: (value: number | undefined) => void;
  fromDate: string;
  setFromDate: (value: string) => void;
  toDate: string;
  setToDate: (value: string) => void;
  onFilter: () => void;
}

const ActivityFilters: React.FC<ActivityFiltersProps> = ({
  search,
  setSearch,
  activityType,
  setActivityType,
  minValue,
  setMinValue,
  maxValue,
  setMaxValue,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  onFilter,
}) => {
  return (
    <div className="mb-4 flex items-end justify-between space-x-4 text-muted-400">
      {/* Search Input */}
      <div className="w-64">
        <Input
          icon="mdi:magnify"
          label="Search"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or ID"
          type="text"
          value={search}
        />
      </div>

      <div className="flex items-end gap-4">
        {/* Activity Type Select */}
        <Select
          className="rounded-md bg-muted-800 px-4 py-2"
          label="Activity Type"
          onChange={(e) => setActivityType(e.target.value)}
          options={["All", "Transaction", "Bid"]}
          value={activityType}
        />

        {/* Min and Max Value Inputs */}
        <Input
          label="Min. value"
          onChange={(e) => setMinValue(Number(e.target.value))}
          placeholder="Min. value"
          type="number"
          value={minValue !== undefined ? minValue : ""}
        />
        <Input
          label="Max. value"
          onChange={(e) => setMaxValue(Number(e.target.value))}
          placeholder="Max. value"
          type="number"
          value={maxValue !== undefined ? maxValue : ""}
        />

        {/* From and To Date Inputs */}
        <Input
          label="From"
          onChange={(e) => setFromDate(e.target.value)}
          type="date"
          value={fromDate}
        />
        <Input
          label="To"
          onChange={(e) => setToDate(e.target.value)}
          type="date"
          value={toDate}
        />

        {/* Filter Button */}
        <Tooltip content="Filter">
          <IconButton onClick={onFilter}>
            <Icon icon="mdi:filter" />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
};

export default ActivityFilters;

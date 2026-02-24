import { Icon } from "@iconify/react";
import type React from "react";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import { Tooltip } from "@/components/elements/base/tooltips/Tooltip";
import Input from "@/components/elements/form/input/Input";
import Select from "@/components/elements/form/select/Select";

interface FiltersProps {
  listingType: string;
  setListingType: (value: string) => void;
  minPrice: number | undefined;
  setMinPrice: (value: number | undefined) => void;
  maxPrice: number | undefined;
  setMaxPrice: (value: number | undefined) => void;
  onFilter: () => void;
}

const Filters: React.FC<FiltersProps> = ({
  listingType,
  setListingType,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  onFilter,
}) => {
  return (
    <div className="flex items-end space-x-4 text-muted-400">
      <Select
        className="rounded-md bg-muted-800 px-4 py-2"
        label="Listing Type"
        onChange={(e) => setListingType(e.target.value)}
        options={["All", "Buy Now", "Auction"]}
        value={listingType}
      />
      <Input
        label="Min. value"
        onChange={(e) => setMinPrice(Number(e.target.value))}
        placeholder="Min. value"
        type="number"
        value={minPrice !== undefined ? minPrice : ""}
      />
      <Input
        label="Max. value"
        onChange={(e) => setMaxPrice(Number(e.target.value))}
        placeholder="Max. value"
        type="number"
        value={maxPrice !== undefined ? maxPrice : ""}
      />

      <Tooltip content="Filter">
        <IconButton onClick={onFilter}>
          <Icon icon="mdi:filter" />
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default Filters;

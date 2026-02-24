import { memo } from "react";
import useMarketStore from "@/stores/trade/market";

const OrderBookRowBase = ({
  index,
  price,
  amount,
  total,
  type,
  maxTotal,
  onRowHover,
  onRowLeave,
  isSelected,
  rowRef,
  lastHoveredIndex,
}) => {
  const bgWidth = `${(total / maxTotal) * 100}%`;
  const { market } = useMarketStore();
  const getPrecision = (type) => Number(market?.precision?.[type] || 8);

  return (
    <div
      className={`relative flex w-full grow cursor-pointer justify-between px-2 py-[2px] ${
        index === lastHoveredIndex
          ? `border-dashed ${
              type === "ask" ? "border-t pt-[1px]!" : "border-b pb-[1px]!"
            } border-muted-300`
          : ""
      }
        ${isSelected ? "bg-muted-100 dark:bg-muted-800" : "bg-transparent"}
        
        `}
      onMouseEnter={() => onRowHover(index, type)}
      onMouseLeave={onRowLeave}
      ref={rowRef}
    >
      <div className="z-10 flex w-full justify-between">
        <div
          className={`w-[50%] text-${
            type === "ask" ? "danger" : "success"
          }-500 text-sm dark:text-${type === "ask" ? "danger" : "success"}-400`}
        >
          {price.toLocaleString(undefined, {
            minimumFractionDigits: getPrecision("price"),
            maximumFractionDigits: getPrecision("price"),
          })}
        </div>
        <div className="hidden text-muted-800 text-sm sm:block dark:text-muted-200">
          {amount.toLocaleString(undefined, {
            minimumFractionDigits: getPrecision("amount"),
            maximumFractionDigits: getPrecision("amount"),
          })}
        </div>
        <div className="w-[30%] text-end text-muted-800 text-sm dark:text-muted-200">
          {total.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>
      <div
        className={`absolute top-0 right-0 bottom-0 left-0 z-0 transition-all duration-300 ease-in-out bg-${
          type === "ask" ? "danger" : "success"
        }-500`}
        style={{ width: bgWidth, opacity: 0.25 }}
      />
    </div>
  );
};

export const OrderBookRow = memo(OrderBookRowBase);

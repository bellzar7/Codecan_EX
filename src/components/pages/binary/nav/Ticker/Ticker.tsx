import { memo } from "react";
import Card from "@/components/elements/base/card/Card";
import useMarketStore from "@/stores/trade/market";
import type { TickerProps } from "./Ticker.types";

const TickerBase = ({}: TickerProps) => {
  const { market, priceChangeData } = useMarketStore();
  return (
    priceChangeData[`${market?.symbol}`] && (
      <div className="flex items-center gap-2">
        <Card
          className="flex flex-col p-[1px] px-3 text-xs"
          shape={"rounded-sm"}
        >
          <span className="text-muted-500 dark:text-muted-400">
            {market?.symbol}
          </span>
          <span className="text-mutted-800 text-sm dark:text-muted-200">
            {priceChangeData[`${market?.symbol}`].price}
          </span>
        </Card>
      </div>
    )
  );
};

export const Ticker = memo(TickerBase);

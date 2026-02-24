import { Icon } from "@iconify/react";
import { memo } from "react";
import useMarketStore from "@/stores/trade/market";

const MarketTabBase = () => {
  const { selectedPair, pairs, setSelectedPair } = useMarketStore();

  const uniquePairs = Array.from(new Set(pairs));

  return (
    <div className="relative p-2">
      <div
        className={
          "scrollbar-hidden flex flex-col items-center overflow-auto text-sm"
        }
      >
        <span className="z-1 cursor-pointer">
          <Icon
            className={`me-1 mb-[2.5px] h-4 w-4 ${
              selectedPair === "WATCHLIST"
                ? "text-warning-500"
                : "text-muted-400"
            }`}
            icon={"uim:favorite"}
            onClick={() => setSelectedPair("WATCHLIST")}
          />
        </span>
        {uniquePairs.map((pair) => (
          <span
            className={`px-2 py-1 ${
              pair === selectedPair
                ? "rounded-md bg-muted-100 text-warning-500 dark:bg-muted-900 dark:text-warning-400"
                : "text-muted-400 hover:text-muted-500 dark:text-muted-500 dark:hover:text-muted-500"
            } cursor-pointer`}
            key={pair}
            onClick={() => setSelectedPair(pair)}
          >
            {pair}
          </span>
        ))}
      </div>
    </div>
  );
};

export const MarketTab = memo(MarketTabBase);

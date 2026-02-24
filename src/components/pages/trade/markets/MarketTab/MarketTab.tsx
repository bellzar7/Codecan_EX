import { Icon } from "@iconify/react";
import { memo, useEffect, useRef, useState } from "react";
import useMarketStore from "@/stores/trade/market";

const MarketTabBase = () => {
  const { selectedPair, pairs, setSelectedPair } = useMarketStore();

  const uniquePairs = Array.from(new Set(pairs));

  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkForOverflow = () => {
    const container = containerRef.current;
    if (!container) return;
    setCanScrollLeft(container.scrollLeft > 1);
    setCanScrollRight(
      Math.ceil(container.scrollLeft + container.clientWidth) <
        container.scrollWidth - 1
    );
  };

  const scrollRight = () => {
    containerRef.current?.scrollBy({ left: 100, behavior: "smooth" });
  };

  const scrollLeft = () => {
    containerRef.current?.scrollBy({ left: -100, behavior: "smooth" });
  };

  useEffect(() => {
    const handleResize = () => {
      checkForOverflow();
    };
    window.addEventListener("resize", handleResize);
    checkForOverflow();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [uniquePairs]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => {
      setCanScrollLeft(container.scrollLeft > 1);
      setCanScrollRight(
        Math.ceil(container.scrollLeft + container.clientWidth) <
          container.scrollWidth - 1
      );
    };
    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="relative p-2">
      {canScrollLeft && (
        <Icon
          className="absolute top-1/2 left-0 -translate-y-1/2 cursor-pointer pb-[2px] text-muted-400 dark:text-muted-500"
          icon="heroicons-outline:chevron-left"
          onClick={scrollLeft}
        />
      )}
      <div
        className={`scrollbar-hidden flex items-center overflow-auto text-sm ${
          canScrollLeft ? "ms-4" : ""
        } ${canScrollRight ? "me-4" : ""}`}
        ref={containerRef}
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
      {canScrollRight && (
        <Icon
          className="absolute top-1/2 right-0 -translate-y-1/2 cursor-pointer pb-[2px] text-muted-400 dark:text-muted-500"
          icon="heroicons-outline:chevron-right"
          onClick={scrollRight}
        />
      )}
    </div>
  );
};

export const MarketTab = memo(MarketTabBase);

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { memo, useState } from "react";
import useMarketStore from "@/stores/trade/market";
import { SortableHeader } from "../SortableHeader";

interface SortState {
  field: string;
  rule: "asc" | "desc";
}

const MarketListBase = ({ type = "trade" }) => {
  const {
    searchQuery,
    marketData,
    watchlistData,
    selectedPair,
    toggleWatchlist,
    priceChangeData,
    withEco,
    market,
  } = useMarketStore();
  const router = useRouter();
  const { practice } = router.query;

  const [sort, setSort] = useState<SortState>({ field: "symbol", rule: "asc" });

  const filteredData =
    selectedPair === "WATCHLIST"
      ? watchlistData.filter((w) => (withEco ? true : !w.isEco))
      : marketData.filter((item) => {
          const matchesSearch = item.symbol
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
          const matchesPair = searchQuery
            ? true
            : selectedPair === "" || item.pair === selectedPair;
          return matchesSearch && matchesPair;
        });

  // Apply sorting
  const sortedData = [...filteredData].sort((a, b) => {
    let comparison = 0;
    if (sort.field === "price" || sort.field === "change") {
      // Compare as numbers
      const numA = Number.parseFloat(
        (
          priceChangeData[a.symbol]?.[sort.field as "price" | "change"] ?? 0
        ).toString()
      );
      const numB = Number.parseFloat(
        (
          priceChangeData[b.symbol]?.[sort.field as "price" | "change"] ?? 0
        ).toString()
      );
      comparison = numA - numB;
    } else {
      // Compare as strings
      comparison = a[sort.field].localeCompare(b[sort.field]);
    }
    return sort.rule === "asc" ? comparison : -comparison;
  });

  return (
    <div className="w-full text-muted-500 text-sm dark:text-muted-400">
      <div className="flex p-2 font-semibold">
        <SortableHeader
          className="w-[40%]"
          field="symbol"
          setSort={setSort}
          sort={sort}
        />
        <SortableHeader
          className="w-[40%]"
          field="price"
          setSort={setSort}
          sort={sort}
        />
        <SortableHeader
          className="w-[20%] text-end"
          field="change"
          setSort={setSort}
          sort={sort}
        />
      </div>
      <div
        className={`slimscroll h-full w-full space-y-1 overflow-y-auto px-1 ${
          type === "trade"
            ? "max-h-[calc(50vh_-_64px)]"
            : "max-h-[calc(40vh_-_64px)]"
        }`}
      >
        {sortedData.map((item) => {
          const linkHref = `/${type}/${item.symbol.replace("/", "_")}${
            type === "binary" && practice ? "?practice=true" : ""
          }`;

          return (
            <Link className="w-full" href={linkHref} key={item.id}>
              <div
                className={`flex w-full cursor-pointer rounded-sm px-1 py-[2px] text-xs hover:bg-muted-100 dark:hover:bg-muted-800 ${
                  item.symbol === `${market?.symbol}`
                    ? "bg-muted-100 dark:bg-muted-800"
                    : ""
                }`}
              >
                <span className="flex w-[40%] items-center gap-1">
                  <Icon
                    className={`me-1 mb-[1px] h-3 w-3 cursor-pointer ${
                      watchlistData &&
                      watchlistData.find((w) => w.symbol === item.symbol)
                        ? "text-warning-500 hover:text-muted-500"
                        : "text-muted-400 hover:text-warning-500"
                    }`}
                    icon={"uim:favorite"}
                    onClick={() => toggleWatchlist(item.symbol)}
                  />
                  <span>
                    {item.currency}/
                    <span className="text-muted-400 dark:text-muted-500">
                      {item.pair}
                    </span>
                  </span>
                </span>
                <span className="w-[40%]">
                  {priceChangeData[item.symbol]?.price ?? item.price}
                </span>
                <span
                  className={`w-[20%] text-end ${
                    Number(priceChangeData[item.symbol]?.change ?? 0) >= 0
                      ? Number(priceChangeData[item.symbol]?.change ?? 0) === 0
                        ? ""
                        : "text-success-500"
                      : "text-danger-500"
                  }`}
                >
                  {priceChangeData[item.symbol]?.change ?? 0}%
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export const MarketList = memo(MarketListBase);

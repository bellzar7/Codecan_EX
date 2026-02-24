import { debounce } from "lodash";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useDashboardStore } from "@/stores/dashboard";
import $fetch from "@/utils/api";
import MarketsPagination from "./MarketsPagination";
import MarketsTable from "./MarketsTable";
import MarketsToolbar from "./MarketsToolbar";

interface TwdMarketsProps {
  type: "forex" | "stocks" | "indices";
}

const TwdMarketsBase = ({ type }: TwdMarketsProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { isDark, profile } = useDashboardStore();

  const [baseItems, setBaseItems] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pages, setPages] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [sorted, setSorted] = useState<{ field: string; rule: "asc" | "desc" }>(
    {
      field: "",
      rule: "asc",
    }
  );
  const [pagination, setPagination] = useState({
    total: 0,
    lastPage: 0,
    currentPage: 1,
    from: 1,
    to: 25,
  });

  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [tickers, setTickers] = useState<Record<string, any>>({});

  // TWD now uses SPOT wallets (same as Binance)
  // Fetch USD balance as the primary quote currency for forex
  const fetchWalletBalance = useCallback(async () => {
    if (!profile?.id) return;

    const { data, error } = await $fetch({
      url: "/api/finance/wallet/SPOT/USD",
      silent: true,
    });

    if (!error && data) {
      setWalletBalance((data as any).balance);
    } else {
      // Wallet doesn't exist yet - show 0 balance
      setWalletBalance(0);
    }
  }, [profile?.id]);

  const fetchTickers = useCallback(async () => {
    const { data, error } = await $fetch({
      url: "/api/ext/twd/ticker",
      silent: true,
    });

    if (!error && data && Object.keys(data).length > 0) {
      setTickers(data);
      // Update baseItems directly with ticker data
      setBaseItems((prevItems) =>
        prevItems.map((item) => {
          const ticker = data[item.symbol];
          if (ticker) {
            return {
              ...item,
              price: ticker.price?.toFixed(6) || item.price,
              change: ticker.change?.toFixed(2) || item.change,
              baseVolume: ticker.volume?.toString() || item.baseVolume,
              high: ticker.high?.toFixed(6) || item.high,
              low: ticker.low?.toFixed(6) || item.low,
              percentage: ticker.changePercent || item.percentage,
            };
          }
          return item;
        })
      );
    }
  }, []);

  const fetchTwdMarkets = useCallback(async () => {
    setLoading(true);

    // Fetch markets and tickers in parallel
    const [marketsResponse, tickersResponse] = await Promise.all([
      $fetch({
        url: `/api/ext/twd/market?type=${type}`,
        silent: true,
      }),
      $fetch({
        url: "/api/ext/twd/ticker",
        silent: true,
      }),
    ]);

    if (!marketsResponse.error && marketsResponse.data) {
      const tickerData = tickersResponse.data || {};

      const markets = (marketsResponse.data as any).map((item: any) => {
        const ticker = (tickerData as any)[item.symbol];

        return {
          id: item.id,
          symbol: item.symbol,
          currency: item.currency,
          pair: item.pair,
          exchange: item.exchange,
          type: item.type,
          name: item.name,
          isTwd: true,
          isEco: true, // Mark as ECO for styling purposes
          // Use real ticker data if available
          price: ticker?.price?.toFixed(6) || "0.00",
          change: ticker?.change?.toFixed(2) || "0.00",
          baseVolume: ticker?.volume?.toString() || "0",
          quoteVolume: "0",
          high: ticker?.high?.toFixed(6) || "0.00",
          low: ticker?.low?.toFixed(6) || "0.00",
          percentage: ticker?.changePercent || 0,
          precision: { price: 6, amount: 4 },
        };
      });

      setBaseItems(markets);
      setTickers(tickerData);
    } else if (marketsResponse.error) {
      toast.error(t("Failed to load TWD markets"));
    }
    setLoading(false);
  }, [type, t]);

  const debouncedFetchData = useMemo(
    () => debounce(fetchTwdMarkets, 100),
    [fetchTwdMarkets]
  );

  useEffect(() => {
    if (router.isReady) {
      debouncedFetchData();
      fetchWalletBalance();

      // Start with fast polling (1 second) to quickly pick up ticker data from Redis
      // After getting data, switch to normal 5-second polling
      let hasData = false;
      let fastInterval: NodeJS.Timeout | null = null;
      let normalInterval: NodeJS.Timeout | null = null;

      const startNormalPolling = () => {
        if (fastInterval) {
          window.clearInterval(fastInterval as any);
          fastInterval = null;
        }
        if (!normalInterval) {
          normalInterval = window.setInterval(() => {
            fetchTickers();
          }, 5000) as any;
        }
      };

      // Fast polling to quickly pick up initial data
      fastInterval = window.setInterval(async () => {
        const { data, error } = await $fetch({
          url: "/api/ext/twd/ticker",
          silent: true,
        });

        if (!error && data && Object.keys(data).length > 0) {
          // Got data - update and switch to normal polling
          setTickers(data);
          setBaseItems((prevItems) =>
            prevItems.map((item) => {
              const ticker = data[item.symbol];
              if (ticker) {
                return {
                  ...item,
                  price: ticker.price?.toFixed(6) || item.price,
                  change: ticker.change?.toFixed(2) || item.change,
                  baseVolume: ticker.volume?.toString() || item.baseVolume,
                  high: ticker.high?.toFixed(6) || item.high,
                  low: ticker.low?.toFixed(6) || item.low,
                  percentage: ticker.changePercent || item.percentage,
                };
              }
              return item;
            })
          );

          if (!hasData) {
            hasData = true;
            startNormalPolling();
          }
        }
      }, 1000) as any;

      // Timeout: if no data after 30 seconds, switch to normal polling anyway
      const timeoutId = window.setTimeout(() => {
        if (!hasData) {
          startNormalPolling();
        }
      }, 30_000) as any;

      return () => {
        if (fastInterval) window.clearInterval(fastInterval as any);
        if (normalInterval) window.clearInterval(normalInterval as any);
        window.clearTimeout(timeoutId as any);
      };
    }
  }, [router.isReady, debouncedFetchData, fetchWalletBalance]);

  const compareOnKey = useCallback((key: string, rule: "asc" | "desc") => {
    return (a: any, b: any) => {
      const valueA = a[key] ?? null;
      const valueB = b[key] ?? null;

      if (typeof valueA === "string" && typeof valueB === "string") {
        return rule === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      if (typeof valueA === "number" && typeof valueB === "number") {
        return rule === "asc" ? valueA - valueB : valueB - valueA;
      }
      return 0;
    };
  }, []);

  useEffect(() => {
    let newItems = [...baseItems];

    // Filter by search
    if (searchQuery) {
      newItems = newItems.filter(
        (item) =>
          item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort if needed
    if (sorted.field) {
      newItems.sort(compareOnKey(sorted.field, sorted.rule));
    }

    setItems(newItems);
  }, [baseItems, searchQuery, sorted, compareOnKey]);

  const updatePagination = useCallback(
    (totalItems: number, itemsPerPage: number, page: number) => {
      const lastPage = Math.ceil(totalItems / itemsPerPage);
      const from = (page - 1) * itemsPerPage + 1;
      const to = Math.min(page * itemsPerPage, totalItems);

      setPagination((prev) => {
        if (
          prev.total === totalItems &&
          prev.lastPage === lastPage &&
          prev.currentPage === page &&
          prev.from === from &&
          prev.to === to
        ) {
          return prev;
        }
        return { total: totalItems, lastPage, currentPage: page, from, to };
      });

      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const newPages = Array.from({ length: totalPages }, (_, i) => i + 1);
      setPages((prev) =>
        JSON.stringify(prev) === JSON.stringify(newPages) ? prev : newPages
      );
    },
    []
  );

  useEffect(() => {
    updatePagination(items.length, perPage, currentPage);
  }, [items.length, perPage, currentPage, updatePagination]);

  const changePage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= pagination.lastPage && page !== currentPage) {
        setCurrentPage(page);
      }
    },
    [pagination.lastPage, currentPage]
  );

  const changePerPage = useCallback(
    (newPerPage: number) => {
      if (newPerPage !== perPage) {
        setPerPage(newPerPage);
        setCurrentPage(1);
      }
    },
    [perPage]
  );

  const sortData = useCallback((field: string, rule: "asc" | "desc") => {
    setSorted({ field, rule });
    setCurrentPage(1);
  }, []);

  const search = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleNavigation = useCallback(
    (symbol: string) => {
      router.push(`/trade/${symbol.replace("/", "_")}`);
    },
    [router]
  );

  if (loading) {
    return (
      <main id="datatable">
        <MarketsToolbar onSearch={search} t={t} />
        <div className="mb-4 animate-pulse rounded bg-muted-100 p-4 dark:bg-muted-800">
          <div className="mb-2 h-4 w-3/4 rounded bg-muted-200 dark:bg-muted-700" />
          <div className="h-3 w-1/2 rounded bg-muted-200 dark:bg-muted-700" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              className="animate-pulse rounded bg-muted-100 p-4 dark:bg-muted-800"
              key={i}
            >
              <div className="flex justify-between">
                <div className="h-4 w-1/4 rounded bg-muted-200 dark:bg-muted-700" />
                <div className="h-4 w-1/6 rounded bg-muted-200 dark:bg-muted-700" />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main id="datatable">
      <MarketsToolbar onSearch={search} t={t} />
      <div className="mb-4 rounded border-info-500 border-l-4 bg-info-100 p-4 dark:bg-info-900/20">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-1 items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-info-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  clipRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  fillRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-info-700 text-sm dark:text-info-300">
                <strong>{t("TwelveData Trading")}:</strong>{" "}
                {t(
                  "Trading uses your SPOT wallet balances. Contact admin to credit your account."
                )}
              </p>
              {profile?.id && walletBalance !== null && (
                <p className="mt-2 text-info-700 text-sm dark:text-info-300">
                  <strong>{t("USD Balance")}:</strong>{" "}
                  <span className="font-mono">
                    $
                    {walletBalance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    USD
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <MarketsTable
        handleNavigation={handleNavigation}
        isDark={isDark}
        items={items}
        pagination={pagination}
        perPage={perPage}
        sort={sortData}
        sorted={sorted}
        t={t}
      />
      <MarketsPagination
        changePage={changePage}
        changePerPage={changePerPage}
        currentPage={currentPage}
        pages={pages}
        pagination={pagination}
        perPage={perPage}
        t={t}
      />
    </main>
  );
};

export default memo(TwdMarketsBase);

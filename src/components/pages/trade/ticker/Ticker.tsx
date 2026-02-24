import { memo, useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { formatLargeNumber } from "@/utils/market";
import "react-loading-skeleton/dist/skeleton.css";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useDashboardStore } from "@/stores/dashboard";
import useMarketStore from "@/stores/trade/market";
import useWebSocketStore from "@/stores/trade/ws";
import $fetch from "@/utils/api";

const TickerBase = () => {
  const { t } = useTranslation();
  const { isDark } = useDashboardStore();
  const { market } = useMarketStore();
  const {
    subscribe,
    unsubscribe,
    addMessageHandler,
    removeMessageHandler,
    tradesConnection,
    ecoTradesConnection,
  } = useWebSocketStore();
  const router = useRouter();
  const getPrecision = (type: string) => Number(market?.precision?.[type] || 8);

  const [ticker, setTicker] = useState<Ticker>();
  const [clientIsDark, setClientIsDark] = useState(false);

  useEffect(() => {
    setClientIsDark(isDark);
  }, [isDark]);

  // TWD ticker polling
  useEffect(() => {
    if (!(router.isReady && market && (market as any).isTwd)) return;

    const fetchTwdTicker = async () => {
      const { data, error } = await $fetch({
        url: "/api/ext/twd/ticker",
        silent: true,
      });

      if (!error && data && data[market.symbol]) {
        const twdTicker = data[market.symbol];
        setTicker({
          symbol: market.symbol,
          last: twdTicker.price,
          close: twdTicker.price,
          open: twdTicker.open,
          high: twdTicker.high,
          low: twdTicker.low,
          change: twdTicker.change,
          percentage: twdTicker.changePercent,
          baseVolume: twdTicker.volume,
          quoteVolume: 0,
        } as Ticker);
      }
    };

    // Fetch immediately
    fetchTwdTicker();

    // Then poll every 5 seconds
    const interval = setInterval(fetchTwdTicker, 5000);

    return () => {
      clearInterval(interval);
      setTicker(undefined);
    };
  }, [router.isReady, market]);

  useEffect(() => {
    if (router.isReady && market && !(market as any).isTwd) {
      const handleBinanceTickerMessage = (message: any) => {
        if (message.stream !== "ticker") return;
        const { data } = message;
        if (!data) return;

        const { info, ...tickerData } = data;
        setTicker(tickerData);
      };

      const handleKucoinTickerMessage = (message: any) => {
        if (message.stream !== "ticker") return;
        const { data } = message;
        if (!data || data.symbol !== market.symbol) return;

        const tickerData = {
          symbol: data.symbol,
          timestamp: data.timestamp,
          datetime: data.datetime,
          bid: data.bid,
          bidVolume: data.bidVolume,
          ask: data.ask,
          askVolume: data.askVolume,
          close: data.close,
          last: data.last,
        };

        setTicker(tickerData);
      };

      const handleXtTickerMessage = (message: any) => {
        if (message.stream !== "ticker") return;
        const { data } = message;
        if (!data || data.symbol !== market.symbol) return;

        const tickerData: Ticker = {
          symbol: data.symbol,
          timestamp: data.timestamp,
          datetime: data.datetime,
          high: data.high,
          low: data.low,
          open: data.open,
          close: data.close,
          last: data.last,
          change: data.change,
          percentage: data.percentage,
          average: data.average,
          quoteVolume: data.quoteVolume,
        };

        setTicker(tickerData);
      };

      const resetTicker = () => {
        setTicker(undefined);
      };

      const messageFilter = (message: any) => message.stream === "ticker";
      const { isEco } = market;
      const connectionKey = isEco ? "ecoTradesConnection" : "tradesConnection";
      const connection = isEco ? ecoTradesConnection : tradesConnection;

      let handler;
      switch (process.env.NEXT_PUBLIC_EXCHANGE) {
        case "bin":
          handler = handleBinanceTickerMessage;
          break;
        case "kuc":
          handler = handleKucoinTickerMessage;
          break;
        case "xt":
          handler = handleXtTickerMessage;
          break;
        default:
          handler = handleBinanceTickerMessage;
          break;
      }

      if (connection?.isConnected) {
        addMessageHandler(connectionKey, handler, messageFilter);
        subscribe(connectionKey, "ticker", { symbol: market?.symbol });
      }

      return () => {
        if (connection?.isConnected) {
          unsubscribe(connectionKey, "ticker", { symbol: market?.symbol });
          removeMessageHandler(connectionKey, handler);
          resetTicker();
        }
      };
    }
  }, [
    router.isReady,
    market,
    tradesConnection?.isConnected,
    ecoTradesConnection?.isConnected,
  ]);

  return (
    <div className="flex h-full items-center justify-center gap-5 p-2 text-muted-800 dark:text-muted-200">
      <div className="hidden border-muted-300 border-r pe-5 md:block dark:border-muted-700">
        {ticker?.symbol || (
          <Skeleton
            baseColor={clientIsDark ? "#27272a" : "#f7fafc"}
            height={16}
            highlightColor={clientIsDark ? "#3a3a3e" : "#edf2f7"}
            width={80}
          />
        )}
      </div>
      <div className="flex h-full w-full">
        <div className="flex h-full w-1/3 flex-col items-center gap-1 md:flex-row">
          <div className="w-full text-sm md:w-1/2 md:text-lg">
            <span className="block md:hidden">
              {ticker?.symbol || (
                <Skeleton
                  baseColor={clientIsDark ? "#27272a" : "#f7fafc"}
                  height={12}
                  highlightColor={clientIsDark ? "#3a3a3e" : "#edf2f7"}
                  width={60}
                />
              )}
            </span>
            <span>
              {ticker?.last?.toFixed(5) || (
                <Skeleton
                  baseColor={clientIsDark ? "#27272a" : "#f7fafc"}
                  height={10}
                  highlightColor={clientIsDark ? "#3a3a3e" : "#edf2f7"}
                  width={40}
                />
              )}
            </span>
          </div>
          {process.env.NEXT_PUBLIC_EXCHANGE &&
            ["bin", "xt"].includes(process.env.NEXT_PUBLIC_EXCHANGE) && (
              <div className="w-full text-xs md:w-1/2 md:text-sm">
                <span className="text-muted-600 dark:text-muted-400">
                  {t("24h change")}
                </span>
                <div className="flex items-center gap-1 text-md">
                  <span
                    className={
                      ticker && ticker?.percentage && ticker.percentage >= 0
                        ? ticker?.percentage === 0
                          ? ""
                          : "text-success-500"
                        : "text-danger-500"
                    }
                  >
                    {ticker?.change !== undefined ? (
                      ticker.change.toFixed(2)
                    ) : (
                      <Skeleton
                        baseColor={clientIsDark ? "#27272a" : "#f7fafc"}
                        height={10}
                        highlightColor={clientIsDark ? "#3a3a3e" : "#edf2f7"}
                        width={40}
                      />
                    )}
                  </span>
                  <span
                    className={`text-xs ${
                      ticker && ticker?.percentage && ticker.percentage >= 0
                        ? ticker?.percentage === 0
                          ? ""
                          : "text-success-500"
                        : "text-danger-500"
                    }`}
                  >
                    {ticker?.percentage !== undefined ? (
                      `${ticker.percentage.toFixed(2)}%`
                    ) : (
                      <Skeleton
                        baseColor={clientIsDark ? "#27272a" : "#f7fafc"}
                        height={8}
                        highlightColor={clientIsDark ? "#3a3a3e" : "#edf2f7"}
                        width={30}
                      />
                    )}
                  </span>
                </div>
              </div>
            )}
        </div>
        {process.env.NEXT_PUBLIC_EXCHANGE &&
          ["bin", "xt"].includes(process.env.NEXT_PUBLIC_EXCHANGE) && (
            <>
              <div className="flex h-full w-1/3 flex-col items-center justify-between text-xs md:flex-row md:text-sm">
                <div className="w-full md:w-1/2">
                  <span className="text-muted-600 dark:text-muted-400">
                    {t("24h high")}
                  </span>
                  <div>
                    {ticker?.high?.toFixed(5) || (
                      <Skeleton
                        baseColor={clientIsDark ? "#27272a" : "#f7fafc"}
                        height={10}
                        highlightColor={clientIsDark ? "#3a3a3e" : "#edf2f7"}
                        width={40}
                      />
                    )}
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <span className="text-muted-600 dark:text-muted-400">
                    {t("24h low")}
                  </span>
                  <div>
                    {ticker?.low?.toFixed(5) || (
                      <Skeleton
                        baseColor={clientIsDark ? "#27272a" : "#f7fafc"}
                        height={10}
                        highlightColor={clientIsDark ? "#3a3a3e" : "#edf2f7"}
                        width={40}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex h-full w-1/3 flex-col items-center justify-between text-xs md:flex-row md:text-sm">
                {process.env.NEXT_PUBLIC_EXCHANGE === "bin" && (
                  <div className="w-full md:w-1/2">
                    <span className="text-muted-600 dark:text-muted-400">
                      {t("24h volume")} ({market?.currency})
                    </span>
                    <div>
                      {ticker?.baseVolume ? (
                        formatLargeNumber(
                          ticker.baseVolume,
                          getPrecision("amount")
                        )
                      ) : (
                        <Skeleton
                          baseColor={clientIsDark ? "#27272a" : "#f7fafc"}
                          height={10}
                          highlightColor={clientIsDark ? "#3a3a3e" : "#edf2f7"}
                          width={40}
                        />
                      )}
                    </div>
                  </div>
                )}
                <div className="w-full md:w-1/2">
                  <span className="text-muted-600 dark:text-muted-400">
                    {t("24h volume")} ({market?.pair})
                  </span>
                  <div>
                    {ticker?.quoteVolume ? (
                      formatLargeNumber(
                        ticker.quoteVolume,
                        getPrecision("price")
                      )
                    ) : (
                      <Skeleton
                        baseColor={clientIsDark ? "#27272a" : "#f7fafc"}
                        height={10}
                        highlightColor={clientIsDark ? "#3a3a3e" : "#edf2f7"}
                        width={40}
                      />
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        {process.env.NEXT_PUBLIC_EXCHANGE === "kuc" && (
          <>
            <div className="flex h-full w-1/2 flex-col items-center justify-between text-xs md:flex-row md:text-sm">
              <div className="w-full md:w-1/2">
                <span className="text-muted-600 dark:text-muted-400">
                  {t("Bid")}
                </span>
                <div>
                  {ticker?.bid?.toFixed(5) || (
                    <Skeleton
                      baseColor={clientIsDark ? "#27272a" : "#f7fafc"}
                      height={10}
                      highlightColor={clientIsDark ? "#3a3a3e" : "#edf2f7"}
                      width={40}
                    />
                  )}
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <span className="text-muted-600 dark:text-muted-400">
                  {t("Ask")}
                </span>
                <div>
                  {ticker?.ask?.toFixed(5) || (
                    <Skeleton
                      baseColor={clientIsDark ? "#27272a" : "#f7fafc"}
                      height={10}
                      highlightColor={clientIsDark ? "#3a3a3e" : "#edf2f7"}
                      width={40}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="flex h-full w-1/2 flex-col items-center justify-between text-xs md:flex-row md:text-sm">
              <div className="w-full md:w-1/2">
                <span className="text-muted-600 dark:text-muted-400">
                  {t("Close")}
                </span>
                <div>
                  {ticker?.close?.toFixed(5) || (
                    <Skeleton
                      baseColor={clientIsDark ? "#27272a" : "#f7fafc"}
                      height={10}
                      highlightColor={clientIsDark ? "#3a3a3e" : "#edf2f7"}
                      width={40}
                    />
                  )}
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <span className="text-muted-600 dark:text-muted-400">
                  {t("Last")}
                </span>
                <div>
                  {ticker?.last?.toFixed(5) || (
                    <Skeleton
                      baseColor={clientIsDark ? "#27272a" : "#f7fafc"}
                      height={10}
                      highlightColor={clientIsDark ? "#3a3a3e" : "#edf2f7"}
                      width={40}
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const Ticker = memo(TickerBase);

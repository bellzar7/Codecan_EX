import { memo, useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { formatLargeNumber } from "@/utils/market";
import "react-loading-skeleton/dist/skeleton.css";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useDashboardStore } from "@/stores/dashboard";
import useFuturesMarketStore from "@/stores/futures/market";
import useWebSocketStore from "@/stores/trade/ws";

const TickerBase = () => {
  const { t } = useTranslation();
  const { isDark } = useDashboardStore();
  const { market } = useFuturesMarketStore();
  const {
    subscribe,
    unsubscribe,
    addMessageHandler,
    removeMessageHandler,
    futuresTradesConnection,
  } = useWebSocketStore();
  const router = useRouter();
  const getPrecision = (type: string) => Number(market?.precision?.[type] || 8);

  const [ticker, setTicker] = useState<Ticker>();
  const [clientIsDark, setClientIsDark] = useState(false);

  useEffect(() => {
    setClientIsDark(isDark);
  }, [isDark]);

  useEffect(() => {
    if (router.isReady && market && futuresTradesConnection?.isConnected) {
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

      const resetTicker = () => {
        setTicker(undefined);
      };

      const messageFilter = (message: any) => message.stream === "ticker";
      let handler;
      switch (process.env.NEXT_PUBLIC_EXCHANGE) {
        case "bin":
          handler = handleBinanceTickerMessage;
          break;
        case "kuc":
          handler = handleKucoinTickerMessage;
          break;
        default:
          handler = handleBinanceTickerMessage;
          break;
      }

      addMessageHandler("futuresTradesConnection", handler, messageFilter);
      subscribe("futuresTradesConnection", "ticker", {
        symbol: market?.symbol,
      });

      return () => {
        unsubscribe("futuresTradesConnection", "ticker", {
          symbol: market?.symbol,
        });
        removeMessageHandler("futuresTradesConnection", handler);
        resetTicker();
      };
    }
  }, [router.isReady, market, futuresTradesConnection?.isConnected]);

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
          {process.env.NEXT_PUBLIC_EXCHANGE === "bin" && (
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
                    `${ticker.percentage?.toFixed(2)}%`
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
          <div className="w-full md:w-1/2">
            <span className="text-muted-600 dark:text-muted-400">
              {t("24h volume")} ({market?.currency})
            </span>
            <div>
              {formatLargeNumber(
                ticker?.baseVolume || 0,
                getPrecision("amount")
              ) || (
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
              {t("24h volume")} ({market?.pair})
            </span>
            <div>
              {formatLargeNumber(
                ticker?.quoteVolume || 0,
                getPrecision("price")
              ) || (
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
      </div>
    </div>
  );
};

export const Ticker = memo(TickerBase);

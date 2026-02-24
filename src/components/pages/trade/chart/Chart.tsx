import { memo, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";
import {
  type LanguageCode,
  type ResolutionString,
  type ThemeName,
  type Timezone,
  type TradingTerminalFeatureset,
  widget,
} from "@/data/charting_library/charting_library";
import { getTwdTickers, twdGetCandles } from "@/services/twelvedata";
import { useDashboardStore } from "@/stores/dashboard";
import useMarketStore from "@/stores/trade/market";
import useWebSocketStore from "@/stores/trade/ws";
import $fetch from "@/utils/api";
import { breakpoints } from "@/utils/breakpoints";
import {
  intervalDurations,
  intervals,
  resolutionMap,
  resolutionMap_provider,
  supported_resolutions_provider,
} from "@/utils/chart";
import type { ChartProps } from "./Chart.types";

interface Bar {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  time: string;
}

const twdResolutionMap: Record<string, string> = {
  "1": "1m",
  "3": "3m",
  "5": "5m",
  "15": "15m",
  "30": "30m",
  "60": "1h",
  "120": "2h",
  "240": "4h",
  "1D": "1d",
  "1W": "1w",
  "1M": "1M",
};
const twdIntervalMs: Record<string, number> = {
  "1": 60_000,
  "3": 180_000,
  "5": 300_000,
  "15": 900_000,
  "30": 1_800_000,
  "60": 3_600_000,
  "120": 7_200_000,
  "240": 14_400_000,
  "1D": 86_400_000,
  "1W": 7 * 86_400_000,
  "1M": 30 * 86_400_000,
};

const ChartBase = ({}: ChartProps) => {
  const [chartReady, setChartReady] = useState(false);
  const { unsubscribe, subscribe, addMessageHandler, removeMessageHandler } =
    useWebSocketStore();
  const [tvWidget, setTvWidget] = useState<any>(null);
  const { market } = useMarketStore();
  const [provider, setProvider] = useState<string>();
  const [twdError, setTwdError] = useState<string | null>(null);

  const isTwd = (market as any)?.isTwd;

  const loadCandles = async (from: number, to: number) => {
    if (isTwd) {
      return await twdGetCandles(market.symbol, "1m", from, to);
    }
  };

  useEffect(() => {
    let id: any;
    if (isTwd) {
      const poll = async () => {
        const { items } = await getTwdTickers([market.symbol]);
        // items: [{symbol, price, ts}]
        if (items?.length) {
          // онови останній бар/оверлей ціни у твоєму графіку
          // наприклад, updateLastPrice(items[0].price, items[0].ts)
        }
      };
      poll();
      id = window.setInterval(poll, 3000);
    }
    return () => id && window.clearInterval(id);
  }, [isTwd, market?.symbol]);

  useEffect(() => {
    switch (process.env.NEXT_PUBLIC_EXCHANGE) {
      case "bin":
        setProvider("binance");
        break;
      case "kuc":
        setProvider("kucoin");
        break;
      default:
        setProvider("binance");
        break;
    }
  }, []);

  const disabled_features: TradingTerminalFeatureset[] = [
    "header_compare",
    "symbol_search_hot_key",
    "header_symbol_search",
    "border_around_the_chart",
    "popup_hints",
    "timezone_menu",
  ];
  const enabled_features: TradingTerminalFeatureset[] = [
    "save_chart_properties_to_local_storage",
    "use_localstorage_for_settings",
    "dont_show_boolean_study_arguments",
    "hide_last_na_study_output",
    "constraint_dialogs_movement",
    "countdown",
    "insert_indicator_dialog_shortcut",
    "shift_visible_range_on_new_bar",
    "hide_image_invalid_symbol",
    "pre_post_market_sessions",
    "use_na_string_for_not_available_values",
    "create_volume_indicator_by_default",
    "determine_first_data_request_size_using_visible_range",
    "end_of_period_timescale_marks",
    "secondary_series_extend_time_scale",
    "shift_visible_range_on_new_bar",
  ];
  const isMobile = useMediaQuery({
    maxWidth: Number.parseInt(breakpoints.sm) - 1,
  });
  if (isMobile) {
    disabled_features.push("left_toolbar");
    disabled_features.push("header_fullscreen_button");
    disabled_features.push("timeframes_toolbar");
  } else {
    enabled_features.push("chart_style_hilo");
    enabled_features.push("chart_style_hilo_last_price");
    enabled_features.push("side_toolbar_in_fullscreen_mode");
  }

  const [interval, setInterval] = useState<string | null>("1h");
  const subscribers = useRef<any>({});

  const DataFeed = () => {
    if (!market) return console.error("Currency and pair are required");

    const { isEco } = market;

    const historyPath = isEco
      ? "/api/ext/ecosystem/chart"
      : "/api/exchange/chart";

    const pricescale = 10 ** (market.precision?.price || 8);
    return {
      async onReady(callback) {
        setTimeout(() => {
          callback({
            exchanges: [],
            symbols_types: [],
            supported_resolutions: isEco
              ? intervals
              : supported_resolutions_provider[provider || "binance"],
          });
        }, 0);
      },

      async resolveSymbol(
        symbolName,
        onSymbolResolvedCallback,
        onResolveErrorCallback
      ) {
        setTimeout(() => {
          onSymbolResolvedCallback({
            data_status: "streaming",
            pricescale,
            name: symbolName,
            full_name: symbolName,
            description: symbolName,
            ticker: symbolName,
            type: "crypto",
            session: "24x7",
            format: "price",
            exchange: process.env.NEXT_PUBLIC_SITE_NAME,
            listed_exchange: process.env.NEXT_PUBLIC_SITE_NAME,
            timezone: "Etc/UTC",
            volume_precision: market?.precision?.amount || 8,
            supported_resolutions: isEco
              ? intervals
              : supported_resolutions_provider[provider || "binance"],
            minmov: 1,
            has_intraday: true,
            visible_plots_set: false,
          });
        }, 0);
      },

      async getBars(
        symbolInfo,
        resolution,
        periodParams,
        onHistoryCallback,
        onErrorCallback
      ) {
        // ---- TWD шлях ----
        if ((market as any)?.isTwd) {
          const interval = twdResolutionMap[resolution] || "1m";
          const from = periodParams.from * 1000;
          const to = periodParams.to * 1000;

          try {
            // бек повертає {candles: [[ts,o,h,l,c,v], ...], error?: string}
            const result = await twdGetCandles(
              market.symbol,
              interval,
              from,
              to
            );

            if (result.error) {
              console.warn("[Chart] TWD candles error:", result.error);
              setTwdError(result.error);
              onHistoryCallback([], { noData: true });
              return;
            }

            const bars =
              (result.candles || []).map((r: any[]) => ({
                time: Number(r[0]),
                open: Number(r[1]),
                high: Number(r[2]),
                low: Number(r[3]),
                close: Number(r[4]),
                volume: Number(r[5] ?? 0),
              })) ?? [];

            // TradingView очікує зростаючий час
            bars.sort((a, b) => a.time - b.time);

            if (bars.length === 0) {
              setTwdError("No candle data available");
              onHistoryCallback([], { noData: true });
            } else {
              setTwdError(null); // Clear error on success
              onHistoryCallback(bars, { noData: false });
            }
          } catch (error) {
            console.error("[Chart] TWD candles fetch error:", error);
            setTwdError("Failed to fetch candle data");
            onHistoryCallback([], { noData: true });
          }
          return;
        }

        const duration = intervalDurations[resolution] || 0;

        const from = periodParams.from * 1000;
        const to = periodParams.to * 1000;

        try {
          // Fetch historical data from your API
          const response = await $fetch({
            url: historyPath,
            silent: true,
            params: {
              symbol: `${market?.symbol}`,
              interval:
                resolutionMap_provider[provider || "binance"][resolution],
              from,
              to,
              duration,
            },
          });

          // Parse the data from the response
          const data = await response.data;

          // Check if data was returned
          if (data && (data as any).length) {
            // Convert data to the format required by TradingView
            const bars = (data as any).map((item) => ({
              time: item[0],
              open: item[1],
              high: item[2],
              low: item[3],
              close: item[4],
              volume: item[5],
            }));

            // Sort the bars by time
            bars.sort((a, b) => a.time - b.time);

            onHistoryCallback(bars);
          } else {
            onHistoryCallback([], { noData: true });
          }
        } catch (error) {
          onErrorCallback(new Error("Failed to fetch historical data"));
          return;
        }
      },

      subscribeBars(
        symbolInfo,
        resolution,
        onRealtimeCallback,
        subscribeUID,
        onResetCacheNeededCallback
      ) {
        // ---- TWD: Enable live candle updates using ticker polling ----
        // For TWD markets, we poll the ticker endpoint (not /candles) to save API credits.
        // This provides real-time price updates using the same behavior as SPOT markets.
        if ((market as any)?.isTwd) {
          console.log(
            "[Chart] TWD market - enabling live candle updates via ticker polling"
          );

          // Track the last bar state for OHLC updates
          let lastBar: any = null;
          const intervalMs = twdIntervalMs[resolution] || 60_000;

          const pollTicker = async () => {
            try {
              const response = await $fetch({
                url: "/api/ext/twd/ticker",
                silent: true,
              });

              if (
                response.error ||
                !response.data ||
                !response.data[symbolInfo.ticker]
              ) {
                return;
              }

              const ticker = response.data[symbolInfo.ticker];
              const price = ticker.price;
              const now = Date.now();

              // Calculate the bar time (floor to resolution interval)
              const barTime = Math.floor(now / intervalMs) * intervalMs;

              if (!lastBar || lastBar.time < barTime) {
                // New bar
                lastBar = {
                  time: barTime,
                  open: price,
                  high: price,
                  low: price,
                  close: price,
                  volume: ticker.volume || 0,
                };
              } else {
                // Update existing bar
                lastBar.high = Math.max(lastBar.high, price);
                lastBar.low = Math.min(lastBar.low, price);
                lastBar.close = price;
              }

              // Call the TradingView callback to update the chart
              onRealtimeCallback(lastBar);
            } catch (error) {
              console.error("[Chart] TWD ticker poll error:", error);
            }
          };

          // Start polling every 5 seconds (matches ticker update frequency)
          pollTicker(); // Initial fetch
          const twdTimer = window.setInterval(pollTicker, 5000);

          subscribers.current[subscribeUID] = {
            callback: onRealtimeCallback,
            resolution,
            twdTimer,
          };
          return;
        }

        const { isEco } = market;

        if (interval && interval !== resolutionMap[resolution]) {
          const connectionKey = isEco
            ? "ecoTradesConnection"
            : "tradesConnection";
          unsubscribe(connectionKey, "ohlcv", {
            interval,
            symbol: symbolInfo.ticker,
          });
        }

        // Store the subscriber's callback and symbol information in a global map
        const subscriberInfo = {
          callback: onRealtimeCallback,
          symbolInfo,
          resolution,
        };

        subscribers.current[subscribeUID] = subscriberInfo;

        // Subscribe to the trades connection
        const connectionKey = isEco
          ? "ecoTradesConnection"
          : "tradesConnection";
        subscribe(connectionKey, "ohlcv", {
          interval: resolutionMap[resolution],
          symbol: symbolInfo.ticker,
        });

        // Update the current interval
        setInterval(resolution);
      },

      unsubscribeBars(subscriberUID) {
        const sub = subscribers.current[subscriberUID];
        if (!sub) return;
        delete subscribers.current[subscriberUID];

        // ---- TWD: прибираємо таймер ----
        if (sub.twdTimer) {
          clearInterval(sub.twdTimer);
          return;
        }

        if (!subscribers.current[subscriberUID]) return;
        // Remove the subscriber from the global map
        const { symbolInfo, resolution } = subscribers.current[subscriberUID];
        delete subscribers.current[subscriberUID];

        const { isEco } = market;
        const connectionKey = isEco
          ? "ecoTradesConnection"
          : "tradesConnection";
        unsubscribe(connectionKey, "ohlcv", {
          interval: resolutionMap[resolution],
          symbol: symbolInfo.ticker,
        });
        removeMessageHandler(connectionKey, handleBarsMessage);

        // Reset the interval if it's the same as the unsubscribed one
        if (interval === resolution) {
          setInterval(null);
        }
      },
    };
  };

  useEffect(() => {
    if (market?.symbol) {
      setTwdError(null); // Clear any previous errors when market changes
      initTradingView();
    }
  }, [market?.symbol]);

  const handleBarsMessage = (message: any) => {
    const { data } = message;
    if (!data) return;
    // Data processing

    const bar = data[0];

    const newBar: Bar = {
      time: bar[0],
      open: bar[1],
      high: bar[2],
      low: bar[3],
      close: bar[4],
      volume: bar[5],
    };

    // Update the subscriber's chart with the new bar
    Object.keys(subscribers.current).forEach((key) => {
      const subscriber = subscribers.current[key];
      if (subscriber.callback) {
        subscriber.callback(newBar);
      }
    });
  };

  useEffect(() => {
    if (!(market && chartReady)) return;

    const { isEco } = market;
    const connectionKey = isEco ? "ecoTradesConnection" : "tradesConnection";
    const messageFilter = (message: any) =>
      message.stream && message.stream.startsWith("ohlcv");

    addMessageHandler(connectionKey, handleBarsMessage, messageFilter);

    return () => {
      removeMessageHandler(connectionKey, handleBarsMessage);
    };
  }, [market, chartReady]);

  const { isDark } = useDashboardStore();

  useEffect(() => {
    if (
      chartReady &&
      tvWidget?._ready &&
      typeof tvWidget.changeTheme === "function"
    ) {
      tvWidget.changeTheme((isDark ? "Dark" : "Light") as ThemeName);
    }
  }, [isDark, chartReady]);

  async function initTradingView() {
    // cleanup
    if (tvWidget) {
      tvWidget.remove();
      setTvWidget(null);
    }

    if (!market) return console.error("Currency and pair are required");
    const datafeed = (await DataFeed()) as any;
    if (!datafeed) return;
    const widgetOptions = {
      fullscreen: false,
      autosize: true,
      symbol: market?.symbol,
      interval: "60" as ResolutionString,
      container: "tv_chart_container",
      datafeed,
      library_path: "/lib/chart/charting_library/",
      locale: "en" as LanguageCode,
      theme: (isDark ? "Dark" : "Light") as ThemeName,
      timezone: "Etc/UTC" as Timezone,
      client_id: "chart",
      disabled_features,
      enabled_features,
      overrides: {
        "mainSeriesProperties.showCountdown": true,
        "highLowAvgPrice.highLowPriceLinesVisible": true,
        "mainSeriesProperties.highLowAvgPrice.highLowPriceLabelsVisible": true,
        "mainSeriesProperties.showPriceLine": true,
        "paneProperties.background": isDark ? "#18181b" : "#ffffff",
        "paneProperties.backgroundType": "solid",
      },
      custom_css_url: "/lib/chart/themed.css",
    };

    const tv = new widget(widgetOptions);
    setTvWidget(tv);

    tv.onChartReady(() => {
      setChartReady(true);
    });
  }

  return (
    <div className="relative h-full w-full">
      <div className="h-full w-full" id="tv_chart_container" />
      {isTwd && twdError && (
        <div className="absolute top-4 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 transform px-4">
          <div className="rounded border-warning-500 border-l-4 bg-warning-100 p-4 shadow-lg dark:bg-warning-900/20">
            <div className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-6 w-6 flex-shrink-0 text-warning-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  clipRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  fillRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h3 className="mb-1 font-semibold text-sm text-warning-800 dark:text-warning-200">
                  Chart Data Unavailable
                </h3>
                <p className="text-sm text-warning-700 dark:text-warning-300">
                  {twdError.includes("run out of API credits") ||
                  twdError.includes("daily limit") ? (
                    <>
                      <strong>TwelveData daily limit reached.</strong> Candles
                      are temporarily unavailable. The chart will display
                      historical data once API credits reset (typically at
                      midnight UTC). Live price updates continue via ticker.
                    </>
                  ) : (
                    twdError
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const Chart = memo(ChartBase);

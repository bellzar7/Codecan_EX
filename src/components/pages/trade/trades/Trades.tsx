import { formatDate } from "date-fns";
import { useTranslation } from "next-i18next";
import { memo, useEffect, useRef, useState } from "react";
import useMarketStore from "@/stores/trade/market";
import useWebSocketStore from "@/stores/trade/ws";
import $fetch from "@/utils/api";
import { TradeRow } from "./TradeRow";
import type { Trade } from "./Trades.types";
import { TradesTableHeader } from "./TradesTableHeader";

const TradesBase = () => {
  const { t } = useTranslation();
  const [trades, setTrades] = useState<Trade[]>([]);
  const { market } = useMarketStore();
  const {
    subscribe,
    unsubscribe,
    addMessageHandler,
    removeMessageHandler,
    tradesConnection,
    ecoTradesConnection,
  } = useWebSocketStore();

  const lastPriceRef = useRef<number | null>(null);
  const twdTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTradesMessage = (message: any) => {
    const { data } = message;
    if (!data) return;
    const newTrades = data.map((trade: any) => ({
      id: trade.id,
      price: trade.price,
      amount: trade.amount,
      time: formatDate(new Date(trade.datetime || trade.timestamp), "HH:mm:ss"),
      side: trade.side.toLowerCase(),
    }));
    // Avoid duplicates
    setTrades((prevTrades) => {
      const uniqueTrades = newTrades.filter(
        (newTrade) => !prevTrades.some((trade: any) => trade.id === newTrade.id)
      );
      return [...uniqueTrades, ...prevTrades.slice(0, 49)];
    });
  };

  // TWD ticker-based synthetic trades
  useEffect(() => {
    const isTwd = (market as any)?.isTwd;
    if (!(isTwd && market?.symbol)) return;

    const pollTicker = async () => {
      try {
        const response = await $fetch({
          url: "/api/ext/twd/ticker",
          silent: true,
        });

        if (response.error || !response.data || !response.data[market.symbol])
          return;

        const ticker = response.data[market.symbol];
        const price = ticker.price;

        // Generate synthetic trade when price changes
        if (lastPriceRef.current !== null && price !== lastPriceRef.current) {
          const side = price > lastPriceRef.current ? "buy" : "sell";
          const newTrade: Trade = {
            id: `twd-${Date.now()}`,
            price,
            amount: Math.random() * 0.1 + 0.01, // Synthetic amount
            time: formatDate(new Date(), "HH:mm:ss"),
            side,
          };

          setTrades((prevTrades) => [newTrade, ...prevTrades.slice(0, 49)]);
        }

        lastPriceRef.current = price;
      } catch (error) {
        console.error("[Trades] TWD ticker poll error:", error);
      }
    };

    pollTicker();
    twdTimerRef.current = window.setInterval(pollTicker, 3000) as any;

    return () => {
      if (twdTimerRef.current) {
        window.clearInterval(twdTimerRef.current as any);
        twdTimerRef.current = null;
      }
      lastPriceRef.current = null;
      setTrades([]);
    };
  }, [market?.symbol, (market as any)?.isTwd]);

  // SPOT/ECO WebSocket trades
  useEffect(() => {
    if (!(market?.currency && market?.pair)) return;

    // Skip WebSocket for TWD markets
    const isTwd = (market as any)?.isTwd;
    if (isTwd) return;

    const { isEco } = market;
    const connectionKey = isEco ? "ecoTradesConnection" : "tradesConnection";

    const isConnected = isEco
      ? ecoTradesConnection?.isConnected
      : tradesConnection?.isConnected;
    if (!isConnected) return; // ensure websocket is open before subscribing

    const messageFilter = (message: any) => message.stream === "trades";

    addMessageHandler(connectionKey, handleTradesMessage, messageFilter);
    subscribe(connectionKey, "trades", {
      symbol: `${market?.currency}/${market?.pair}`,
    });

    return () => {
      unsubscribe(connectionKey, "trades", {
        symbol: `${market?.currency}/${market?.pair}`,
      });
      removeMessageHandler(connectionKey, handleTradesMessage);
      setTrades([]);
    };
  }, [
    market?.currency,
    market?.pair,
    tradesConnection?.isConnected,
    ecoTradesConnection?.isConnected,
  ]);

  return (
    <>
      <TradesTableHeader />
      <div className="slimscroll m-2 max-h-[50vh] overflow-y-auto">
        {(trades.length > 0 &&
          trades.map((trade, index) => (
            <TradeRow key={index} trade={trade} />
          ))) || (
          <div className="flex h-full items-center justify-center text-sm">
            <span className="text-muted-400 dark:text-muted-500">
              {t("No Trades")}
            </span>
          </div>
        )}
      </div>
    </>
  );
};
export const Trades = memo(TradesBase);

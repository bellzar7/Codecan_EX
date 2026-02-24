// Orderbook.jsx

import { useTranslation } from "next-i18next";
import { memo, useEffect, useRef, useState } from "react";
import { BestPrices } from "@/components/pages/trade/orderbook/BestPrices";
import { DisplayTotals } from "@/components/pages/trade/orderbook/DisplayTotals";
import { OrderBookRow } from "@/components/pages/trade/orderbook/OrderBookRow";
import { OrderBookTableHeader } from "@/components/pages/trade/orderbook/OrderBookTableHeader";
import { OrderbookHeader } from "@/components/pages/trade/orderbook/OrderbookHeader";
import useMarketStore from "@/stores/trade/market";
import useWebSocketStore from "@/stores/trade/ws";
import $fetch from "@/utils/api";

const ordersLimit = 15;
const provider = process.env.NEXT_PUBLIC_EXCHANGE;
const tickSizeLimitMap = {
  0.01: provider === "kuc" ? 50 : 40,
  0.1: provider === "kuc" ? 50 : 80,
  1: provider === "kuc" ? 100 : 160,
  10: provider === "kuc" ? 100 : 320,
};

const orderBookWorker =
  typeof window !== "undefined" ? new Worker("/worker/orderBook.js") : null;

// Generate synthetic orderbook from ticker price
function generateSyntheticOrderbook(price: number, spread = 0.0001) {
  const asks: { price: number; amount: number; total: number }[] = [];
  const bids: { price: number; amount: number; total: number }[] = [];

  let askTotal = 0;
  let bidTotal = 0;

  // Generate 15 levels of asks (above current price)
  for (let i = 0; i < 15; i++) {
    const askPrice = price * (1 + spread * (i + 1));
    const amount = Math.random() * 10 + 1;
    askTotal += amount;
    asks.push({ price: askPrice, amount, total: askTotal });
  }

  // Generate 15 levels of bids (below current price)
  for (let i = 0; i < 15; i++) {
    const bidPrice = price * (1 - spread * (i + 1));
    const amount = Math.random() * 10 + 1;
    bidTotal += amount;
    bids.push({ price: bidPrice, amount, total: bidTotal });
  }

  const totalVolume = askTotal + bidTotal;
  const askPercentage = ((askTotal / totalVolume) * 100).toFixed(2);
  const bidPercentage = ((bidTotal / totalVolume) * 100).toFixed(2);

  return {
    asks: asks.reverse(), // Reverse so lowest ask is at bottom
    bids,
    maxAskTotal: askTotal,
    maxBidTotal: bidTotal,
    askPercentage,
    bidPercentage,
    bestPrices: {
      bestAsk: asks[asks.length - 1]?.price || price * (1 + spread),
      bestBid: bids[0]?.price || price * (1 - spread),
    },
  };
}

const OrderbookBase = () => {
  const { t } = useTranslation();
  const {
    subscribe,
    unsubscribe,
    addMessageHandler,
    removeMessageHandler,
    tradesConnection,
    ecoTradesConnection,
  } = useWebSocketStore();
  const { market } = useMarketStore();
  const askRefs = useRef<Array<HTMLDivElement | null>>([]);
  const bidRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [hoveredType, setHoveredType] = useState<"ask" | "bid" | null>(null);
  const [visible, setVisible] = useState({ asks: true, bids: true });
  const [tickSize, setTickSize] = useState(0.01);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState({
    ask: null as number | null,
    bid: null as number | null,
  });
  const [orderBook, setOrderBook] = useState<{
    asks: { price: number; amount: number; total: number }[];
    bids: { price: number; amount: number; total: number }[];
    maxAskTotal: number;
    maxBidTotal: number;
    askPercentage: string;
    bidPercentage: string;
    bestPrices: {
      bestAsk: number;
      bestBid: number;
    };
  }>({
    asks: [],
    bids: [],
    maxAskTotal: 0,
    maxBidTotal: 0,
    askPercentage: "0.00",
    bidPercentage: "0.00",
    bestPrices: { bestAsk: 0, bestBid: 0 },
  });
  const [cardPosition, setCardPosition] = useState({ top: 0, left: 0 });

  const subscribedRef = useRef(false);
  const previousSymbolRef = useRef<string | undefined>(undefined);
  const previousTickSizeRef = useRef<number | undefined>(undefined);
  const twdTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleRowHover = (index: number, type: "ask" | "bid") => {
    setHoveredIndex((prev) => ({
      ...prev,
      [type]: index,
    }));
    setHoveredType(type);
    setIsHovered(true);
    const ref =
      type === "ask" ? askRefs.current[index] : bidRefs.current[index];
    if (ref) {
      const rect = ref.getBoundingClientRect();
      setCardPosition({
        top: rect.top,
        left: rect.left + rect.width,
      });
    }
  };

  const handleRowLeave = () => {
    setIsHovered(false);
    setHoveredIndex({ bid: null, ask: null });
    setHoveredType(null);
    setCardPosition({ ...cardPosition, top: 0 });
  };

  // TWD ticker-based orderbook updates
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

        // Generate synthetic orderbook from current price
        const syntheticOrderbook = generateSyntheticOrderbook(price);
        setOrderBook(syntheticOrderbook);
      } catch (error) {
        console.error("[Orderbook] TWD ticker poll error:", error);
      }
    };

    pollTicker();
    twdTimerRef.current = window.setInterval(pollTicker, 3000) as any;

    return () => {
      if (twdTimerRef.current) {
        window.clearInterval(twdTimerRef.current as any);
        twdTimerRef.current = null;
      }
    };
  }, [market?.symbol, (market as any)?.isTwd]);

  // SPOT/ECO WebSocket orderbook worker
  useEffect(() => {
    const isTwd = (market as any)?.isTwd;
    if (isTwd) return; // Skip worker for TWD

    if (orderBookWorker && tradesConnection?.isConnected) {
      orderBookWorker.onmessage = (event) => {
        setOrderBook(event.data);
      };
      orderBookWorker.onerror = (error) => {
        console.error("Error from worker:", error);
      };
    }
  }, [tradesConnection?.isConnected, (market as any)?.isTwd]);

  const handleOrderbookMessage = (message: any) => {
    if (message && message.data) {
      // Forward the raw orderbook data to the worker
      orderBookWorker?.postMessage(message.data);
    }
  };

  // SPOT/ECO WebSocket orderbook subscription
  useEffect(() => {
    const isTwd = (market as any)?.isTwd;
    if (isTwd) return; // Skip WebSocket for TWD

    const setupOrderbook = () => {
      if (market?.symbol) {
        const { isEco } = market;
        const connectionKey = isEco
          ? "ecoTradesConnection"
          : "tradesConnection";
        const subscribePayload = {
          limit: isEco ? undefined : tickSizeLimitMap[tickSize],
          symbol: market.symbol,
        };

        const symbolChanged = previousSymbolRef.current !== market.symbol;
        const tickSizeChanged = previousTickSizeRef.current !== tickSize;

        if (
          ((isEco && ecoTradesConnection?.isConnected) ||
            (!isEco && tradesConnection?.isConnected)) &&
          (!subscribedRef.current || symbolChanged || tickSizeChanged)
        ) {
          subscribe(connectionKey, "orderbook", subscribePayload);
          subscribedRef.current = true;
          previousSymbolRef.current = market.symbol;
          previousTickSizeRef.current = tickSize;
        }

        const messageFilter = (message: any) =>
          message.stream && message.stream.startsWith("orderbook");
        addMessageHandler(connectionKey, handleOrderbookMessage, messageFilter);
      }
    };

    const cleanupOrderbook = () => {
      if (subscribedRef.current && market) {
        const { isEco } = market;
        const connectionKey = isEco
          ? "ecoTradesConnection"
          : "tradesConnection";
        const unsubscribePayload = {
          limit: isEco ? undefined : tickSizeLimitMap[tickSize],
          symbol: market.symbol,
        };
        unsubscribe(connectionKey, "orderbook", unsubscribePayload);
        removeMessageHandler(connectionKey, handleOrderbookMessage);
        subscribedRef.current = false;
      }

      setOrderBook({
        asks: [],
        bids: [],
        maxAskTotal: 0,
        maxBidTotal: 0,
        askPercentage: "0.00",
        bidPercentage: "0.00",
        bestPrices: { bestAsk: 0, bestBid: 0 },
      });
    };

    setupOrderbook();

    return () => {
      cleanupOrderbook();
    };
  }, [
    market?.symbol,
    tradesConnection?.isConnected,
    ecoTradesConnection?.isConnected,
    tickSize,
    subscribe,
    unsubscribe,
    addMessageHandler,
    removeMessageHandler,
  ]);

  return (
    <div className="relative z-5 flex w-full min-w-[220px] flex-col overflow-hidden text-xs">
      <OrderbookHeader
        askPercentage={orderBook.askPercentage}
        bidPercentage={orderBook.bidPercentage}
        setVisible={setVisible}
        visible={visible}
      />
      <OrderBookTableHeader />
      <div className="flex flex-row md:flex-col">
        <div className="order-2 hidden md:block">
          <BestPrices {...orderBook.bestPrices} />
        </div>
        {visible.asks && (
          <div className="order-1 flex max-h-[45vh] min-h-[45vh] w-full flex-col-reverse overflow-hidden">
            {orderBook.asks.length > 0 ? (
              orderBook.asks.map((ask, index) => (
                <OrderBookRow
                  index={index}
                  key={index}
                  {...ask}
                  isSelected={
                    hoveredIndex.ask !== null && index <= hoveredIndex.ask
                  }
                  lastHoveredIndex={hoveredIndex.ask}
                  maxTotal={orderBook.maxAskTotal}
                  onRowHover={handleRowHover}
                  onRowLeave={handleRowLeave}
                  rowRef={(el) => (askRefs.current[index] = el)}
                  type="ask"
                />
              ))
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-muted-400 dark:text-muted-500">
                  {t("No Asks")}
                </span>
              </div>
            )}
          </div>
        )}
        {visible.bids && (
          <div className="order-3 flex max-h-[45vh] min-h-[45vh] w-full flex-col overflow-hidden">
            {orderBook.bids.length > 0 ? (
              orderBook.bids.map((bid, index) => (
                <OrderBookRow
                  index={index}
                  key={index}
                  {...bid}
                  isSelected={
                    hoveredIndex.bid !== null && index <= hoveredIndex.bid
                  }
                  lastHoveredIndex={hoveredIndex.bid}
                  maxTotal={orderBook.maxBidTotal}
                  onRowHover={handleRowHover}
                  onRowLeave={handleRowLeave}
                  rowRef={(el) => (bidRefs.current[index] = el)}
                  type="bid"
                />
              ))
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-muted-400 dark:text-muted-500">
                  {t("No Bids")}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      {isHovered && (
        <DisplayTotals
          cardPosition={cardPosition}
          currency={market?.currency}
          hoveredIndex={hoveredIndex}
          hoveredType={hoveredType}
          isHovered={isHovered}
          orderBook={orderBook}
          pair={market?.pair}
        />
      )}
    </div>
  );
};

export const Orderbook = memo(OrderbookBase);

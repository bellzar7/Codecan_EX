import { useTranslation } from "next-i18next";
import { memo, useEffect, useRef, useState } from "react";
import { BestPrices } from "@/components/pages/futures/orderbook/BestPrices";
import { DisplayTotals } from "@/components/pages/futures/orderbook/DisplayTotals";
import { OrderBookRow } from "@/components/pages/futures/orderbook/OrderBookRow";
import { OrderBookTableHeader } from "@/components/pages/futures/orderbook/OrderBookTableHeader";
import { OrderbookHeader } from "@/components/pages/futures/orderbook/OrderbookHeader";
import useFuturesMarketStore from "@/stores/futures/market";
import useMarketStore from "@/stores/trade/market";
import useWebSocketStore from "@/stores/trade/ws";

const ordersLimit = 15;
const provider = process.env.NEXT_PUBLIC_EXCHANGE;
const tickSizeLimitMap = {
  0.01: provider === "kuc" ? 50 : 40,
  0.1: provider === "kuc" ? 50 : 80,
  1: provider === "kuc" ? 100 : 160,
  10: provider === "kuc" ? 100 : 320,
};

const orderBookWorker =
  typeof window !== "undefined" &&
  !(useMarketStore.getState().market as any)?.isTwd
    ? new Worker("/worker/orderBook.js")
    : null;

const OrderbookBase = () => {
  const { t } = useTranslation();
  const {
    subscribe,
    unsubscribe,
    addMessageHandler,
    removeMessageHandler,
    futuresTradesConnection,
  } = useWebSocketStore();
  const { market } = useFuturesMarketStore();
  const askRefs = useRef<Array<HTMLDivElement | null>>([]);
  const bidRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [hoveredType, setHoveredType] = useState<"ask" | "bid" | null>();
  const [visible, setVisible] = useState({ asks: true, bids: true });
  const [tickSize, setTickSize] = useState(0.01);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState({
    ask: null,
    bid: null,
  });
  const [orderBook, setOrderBook] = useState<{
    asks: {
      price: number;
      amount: number;
      total: number;
    }[];
    bids: {
      price: number;
      amount: number;
      total: number;
    }[];
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

  useEffect(() => {
    if (orderBookWorker && futuresTradesConnection?.isConnected) {
      orderBookWorker.onmessage = (event) => {
        setOrderBook(event.data);
      };
      orderBookWorker.onerror = (error) => {
        console.error("Error from worker:", error);
      };
    }
  }, [futuresTradesConnection?.isConnected]);

  const [orderbookReady, setOrderbookReady] = useState(false);
  useEffect(() => {
    if (futuresTradesConnection?.isConnected && market?.symbol) {
      const subscribePayload = {
        symbol: market.symbol,
      };
      subscribe("futuresTradesConnection", "orderbook", subscribePayload);
      setOrderbookReady(true);
      return () => {
        unsubscribe("futuresTradesConnection", "orderbook", subscribePayload);
        setOrderbookReady(false);
      };
    }
  }, [market?.symbol, futuresTradesConnection?.isConnected]);

  useEffect(() => {
    if (orderbookReady) {
      const handleOrderbookMessage = (message: any) => {
        if (message && message.data) {
          orderBookWorker?.postMessage(message.data);
        }
      };
      const messageFilter = (message: any) =>
        message.stream && message.stream.startsWith("orderbook");
      addMessageHandler(
        "futuresTradesConnection",
        handleOrderbookMessage,
        messageFilter
      );
      return () => {
        removeMessageHandler("futuresTradesConnection", handleOrderbookMessage);
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
    }
  }, [orderbookReady]);

  return (
    <>
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
            <div className="order-1 flex max-h-[45vh] min-h-[45vh] w-full grow flex-col-reverse overflow-hidden">
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
            <div className="order-3 flex max-h-[45vh] min-h-[45vh] w-full grow flex-col overflow-hidden">
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
    </>
  );
};
export const Orderbook = memo(OrderbookBase);

import { Icon } from "@iconify/react";
import { format } from "date-fns";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import Progress from "@/components/elements/base/progress/Progress";
import { formatTime } from "@/hooks/useBinaryCountdown";
import useMarketStore from "@/stores/trade/market";

type OrderDetailsProps = {
  order: any | null;
};

export const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
  const priceChangeData = useMarketStore((state) => state.priceChangeData);
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const [profit, setProfit] = useState(0);

  const binaryRiseFallProfit = Number.parseFloat(
    process.env.NEXT_PUBLIC_BINARY_PROFIT || "87"
  );
  const binaryHigherLowerProfit = Number.parseFloat(
    process.env.NEXT_PUBLIC_BINARY_HIGHER_LOWER_PROFIT || "87"
  );
  const binaryTouchNoTouchProfit = Number.parseFloat(
    process.env.NEXT_PUBLIC_BINARY_TOUCH_NO_TOUCH_PROFIT || "87"
  );
  const binaryCallPutProfit = Number.parseFloat(
    process.env.NEXT_PUBLIC_BINARY_CALL_PUT_PROFIT || "87"
  );
  const binaryTurboProfit = Number.parseFloat(
    process.env.NEXT_PUBLIC_BINARY_TURBO_PROFIT || "87"
  );

  const profitForOrderType = (type: string) => {
    switch (type) {
      case "HIGHER_LOWER":
        return binaryHigherLowerProfit;
      case "TOUCH_NO_TOUCH":
        return binaryTouchNoTouchProfit;
      case "CALL_PUT":
        return binaryCallPutProfit;
      case "TURBO":
        return binaryTurboProfit;
      case "RISE_FALL":
      default:
        return binaryRiseFallProfit;
    }
  };

  const calcValues = useCallback(() => {
    if (!order) return;
    const {
      closedAt,
      createdAt,
      amount,
      side,
      symbol,
      price,
      status,
      barrier,
      strikePrice,
      payoutPerPoint,
      type,
    } = order;

    const orderPrice = Number.parseFloat(String(price)) || 0;
    const totalTime =
      (new Date(closedAt).getTime() - new Date(createdAt).getTime()) / 1000;
    const currentTime = new Date().getTime();
    const totalSeconds = Math.max(
      0,
      (new Date(closedAt).getTime() - currentTime) / 1000
    );
    const elapsedSeconds = totalTime - totalSeconds;
    const progressPercentage = Math.max((elapsedSeconds / totalTime) * 100, 0);

    setTimeLeft(totalSeconds);
    setProgress(progressPercentage);

    const fetchedPrice = priceChangeData[symbol]?.price;
    const currentMarketPrice =
      fetchedPrice !== undefined
        ? Number.parseFloat(String(fetchedPrice)) || orderPrice
        : orderPrice;

    // If order completed, profit is fixed by backend
    if (status !== "PENDING") {
      setProfit(order.profit || 0);
      return;
    }

    // For PENDING:
    const profitPerc = profitForOrderType(type);
    let calcProfit = 0;

    switch (type) {
      case "RISE_FALL":
        if (side === "RISE") {
          calcProfit =
            currentMarketPrice > orderPrice
              ? amount * (profitPerc / 100)
              : -amount;
        } else {
          calcProfit =
            currentMarketPrice < orderPrice
              ? amount * (profitPerc / 100)
              : -amount;
        }
        break;
      case "HIGHER_LOWER":
        if (barrier) {
          if (side === "HIGHER") {
            calcProfit =
              currentMarketPrice > barrier
                ? amount * (profitPerc / 100)
                : -amount;
          } else {
            calcProfit =
              currentMarketPrice < barrier
                ? amount * (profitPerc / 100)
                : -amount;
          }
        }
        break;
      case "TOUCH_NO_TOUCH":
        // Pending logic guess: If close to barrier, guess TOUCH scenario:
        if (barrier) {
          const diff = Math.abs((currentMarketPrice - barrier) / barrier);
          const touchedNow = diff < 0.001;
          if (side === "TOUCH") {
            calcProfit = touchedNow ? amount * (profitPerc / 100) : -amount;
          } else {
            calcProfit = touchedNow ? -amount : amount * (profitPerc / 100);
          }
        }
        break;
      case "CALL_PUT":
        if (strikePrice) {
          if (side === "CALL") {
            calcProfit =
              currentMarketPrice > strikePrice
                ? amount * (profitPerc / 100)
                : -amount;
          } else {
            calcProfit =
              currentMarketPrice < strikePrice
                ? amount * (profitPerc / 100)
                : -amount;
          }
        }
        break;
      case "TURBO":
        if (barrier && payoutPerPoint) {
          const difference =
            side === "UP"
              ? currentMarketPrice - barrier
              : barrier - currentMarketPrice;
          if (difference > 0) {
            const payoutValue = difference * payoutPerPoint;
            if (payoutValue > amount) {
              calcProfit = payoutValue - amount;
            } else if (payoutValue === amount) {
              calcProfit = 0;
            } else {
              calcProfit = -amount;
            }
          } else if (difference === 0) {
            calcProfit = 0; // draw-like scenario
          } else {
            calcProfit = -amount;
          }
        }
        break;
    }

    if (totalSeconds > 50) {
      calcProfit = calcProfit * (progressPercentage / 100);
    }

    setProfit(calcProfit);
  }, [order, priceChangeData]);

  useEffect(() => {
    if (!order) return;
    calcValues();
  }, [order, priceChangeData, calcValues]);

  useEffect(() => {
    if (order && order.status === "PENDING") {
      const interval = setInterval(() => {
        calcValues();
      }, 1000);
      return () => clearInterval(interval as any);
    }
  }, [order, calcValues]);

  if (!order) return null;
  const { side, status, type } = order;

  const displayPrice =
    status === "PENDING"
      ? priceChangeData[order.symbol]?.price || order.price || 0
      : order.closePrice;

  let priceColor = "text-gray-400";
  const orderPrice = order.price;
  if (["RISE", "CALL", "TOUCH", "HIGHER", "UP"].includes(side)) {
    priceColor =
      displayPrice > orderPrice
        ? "text-green-500"
        : displayPrice < orderPrice
          ? "text-red-500"
          : "text-gray-400";
  } else {
    priceColor =
      displayPrice < orderPrice
        ? "text-green-500"
        : displayPrice > orderPrice
          ? "text-red-500"
          : "text-gray-400";
  }

  const SideIcon = ["RISE", "HIGHER", "UP", "CALL", "TOUCH"].includes(side) ? (
    <Icon className="text-green-500" icon="ant-design:arrow-up-outlined" />
  ) : (
    <Icon className="text-red-500" icon="ant-design:arrow-down-outlined" />
  );

  return (
    <div className="overflow-auto rounded-md border border-muted-200 bg-white p-4 dark:border-muted-800 dark:bg-muted-900">
      {/* Header Section */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-lg text-neutral-800 dark:text-neutral-100">
            {SideIcon}
            {order.symbol}
          </h3>
          <p className="text-neutral-600 text-sm dark:text-neutral-400">
            {format(new Date(order.createdAt), "yyyy-MM-dd HH:mm")} - {side}
          </p>
        </div>
        <div className="text-right">
          <span
            className={`inline-block rounded-md px-2 py-1 font-medium text-sm ${
              profit > 0
                ? "bg-green-100 text-green-700"
                : profit < 0
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-600"
            }`}
          >
            Profit: {profit.toFixed(2)}
          </span>
        </div>
      </div>

      {/* If pending, show countdown and progress. Otherwise, show closed date */}
      {status === "PENDING" ? (
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Icon className="text-muted-500" icon="mdi:timer-outline" />
            <span className="text-neutral-600 dark:text-neutral-400">
              Ends in: {formatTime(timeLeft)}
            </span>
          </div>
          <Progress size="xs" value={progress} />
        </div>
      ) : (
        <div className="mb-4 flex items-center gap-2 text-sm">
          <Icon className="text-muted-500" icon="mdi:calendar-check-outline" />
          <span className="text-neutral-600 dark:text-neutral-400">
            Closed At: {format(new Date(order.closedAt), "yyyy-MM-dd HH:mm:ss")}
          </span>
        </div>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-neutral-700 text-sm dark:text-neutral-200">
        <div className="flex flex-col">
          <span className="font-medium text-neutral-500 dark:text-neutral-400">
            Start Price
          </span>
          <span className="font-semibold">{order.price}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-neutral-500 dark:text-neutral-400">
            {status === "PENDING" ? "Current Price" : "Close Price"}
          </span>
          <span className={`font-semibold ${priceColor}`}>{displayPrice}</span>
        </div>

        <div className="flex flex-col">
          <span className="font-medium text-neutral-500 dark:text-neutral-400">
            Side
          </span>
          <span className="flex items-center gap-1 font-semibold">
            {SideIcon} {side}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-neutral-500 dark:text-neutral-400">
            Amount
          </span>
          <span className="font-semibold">{order.amount}</span>
        </div>

        <div className="flex flex-col">
          <span className="font-medium text-neutral-500 dark:text-neutral-400">
            Type
          </span>
          <span className="font-semibold">
            {order.isDemo ? "Demo" : "Real"} ({type})
          </span>
        </div>

        {status === "PENDING" && (
          <div className="flex flex-col">
            <span className="font-medium text-neutral-500 dark:text-neutral-400">
              Expires At
            </span>
            <span className="font-semibold">
              {format(new Date(order.closedAt), "yyyy-MM-dd HH:mm:ss")}
            </span>
          </div>
        )}

        {/* Show additional fields per type */}
        {["HIGHER_LOWER", "TOUCH_NO_TOUCH", "TURBO"].includes(type) &&
          order.barrier && (
            <div className="flex flex-col">
              <span className="font-medium text-neutral-500 dark:text-neutral-400">
                Barrier
              </span>
              <span className="font-semibold">{order.barrier}</span>
            </div>
          )}

        {type === "CALL_PUT" && order.strikePrice && (
          <div className="flex flex-col">
            <span className="font-medium text-neutral-500 dark:text-neutral-400">
              Strike Price
            </span>
            <span className="font-semibold">{order.strikePrice}</span>
          </div>
        )}

        {type === "CALL_PUT" && order.payoutPerPoint && (
          <div className="flex flex-col">
            <span className="font-medium text-neutral-500 dark:text-neutral-400">
              Payout/Point
            </span>
            <span className="font-semibold">{order.payoutPerPoint}</span>
          </div>
        )}

        {type === "TURBO" && order.payoutPerPoint && (
          <div className="flex flex-col">
            <span className="font-medium text-neutral-500 dark:text-neutral-400">
              Payout/Point
            </span>
            <span className="font-semibold">{order.payoutPerPoint}</span>
          </div>
        )}
      </div>
    </div>
  );
};

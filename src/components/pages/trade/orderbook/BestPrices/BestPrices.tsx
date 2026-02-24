import { useTranslation } from "next-i18next";
import { memo, useEffect } from "react";
import useMarketStore from "@/stores/trade/market";
import { useOrderStore } from "@/stores/trade/order";

const BestPricesBase = ({ bestAsk, bestBid }) => {
  const { t } = useTranslation();
  const { setAsk, setBid } = useOrderStore();
  useEffect(() => {
    if (bestAsk) setAsk(bestAsk);
    if (bestBid) setBid(bestBid);
  }, [bestAsk, bestBid]);
  const { market } = useMarketStore();
  const getPrecision = (type) => Number(market?.precision?.[type] || 8);
  return (
    <div className="flex items-center justify-between p-2 text-center text-base text-white">
      <div className="flex items-center gap-1">
        <span className="font-semibold text-muted-600 text-sm dark:text-muted-400">
          {t("Ask")}
        </span>{" "}
        <span className="text-danger-500 text-lg">
          {bestAsk?.toFixed(getPrecision("price"))}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <span className="font-semibold text-muted-600 text-sm dark:text-muted-400">
          {t("Bid")}
        </span>{" "}
        <span className="text-lg text-success-500">
          {bestBid?.toFixed(getPrecision("price"))}
        </span>
      </div>
    </div>
  );
};
export const BestPrices = memo(BestPricesBase);

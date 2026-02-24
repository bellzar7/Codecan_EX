import { useTranslation } from "next-i18next";
import { memo } from "react";
import useMarketStore from "@/stores/trade/market";
import type { TradesTableHeaderProps } from "./TradesTableHeader.types";

const TradesTableHeaderBase = ({}: TradesTableHeaderProps) => {
  const { t } = useTranslation();
  const { market } = useMarketStore();
  return (
    <div className="flex justify-between bg-muted-100 p-2 text-muted-800 text-xs dark:bg-muted-900 dark:text-muted-200">
      <span className="w-[40%] cursor-default">
        {t("Price")}({market?.pair})
      </span>
      <span className="w-[40%] cursor-default">
        {t("Amount")}({market?.currency})
      </span>
      <span className="w-[20%] cursor-default">{t("Time")}</span>
    </div>
  );
};
export const TradesTableHeader = memo(TradesTableHeaderBase);

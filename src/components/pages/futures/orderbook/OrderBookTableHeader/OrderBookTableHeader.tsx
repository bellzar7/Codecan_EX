import { useTranslation } from "next-i18next";
import { memo } from "react";
import useMarketStore from "@/stores/futures/market";
import type { OrderBookTableHeaderProps } from "./OrderBookTableHeader.types";

const OrderBookTableHeaderBase = ({}: OrderBookTableHeaderProps) => {
  const { t } = useTranslation();
  const { market } = useMarketStore();
  return (
    <>
      <div className="flex w-full">
        <div className="flex w-full justify-between bg-muted-100 p-2 text-muted-800 dark:bg-muted-900 dark:text-muted-200">
          <span className="w-[50%] cursor-default">
            {t("Price")}({market?.pair})
          </span>
          <span className="hidden w-[20%] cursor-default sm:block">
            {t("Amount")}({market?.currency})
          </span>
          <span className="w-[30%] cursor-default text-end">{t("Total")}</span>
        </div>

        <div className="flex w-full justify-between bg-muted-100 p-2 text-muted-800 md:hidden dark:bg-muted-900 dark:text-muted-200">
          <span className="w-[50%] cursor-default">
            {t("Price")}({market?.pair})
          </span>
          <span className="hidden w-[20%] cursor-default sm:block">
            {t("Amount")}({market?.currency})
          </span>
          <span className="w-[30%] cursor-default text-end">{t("Total")}</span>
        </div>
      </div>
    </>
  );
};
export const OrderBookTableHeader = memo(OrderBookTableHeaderBase);

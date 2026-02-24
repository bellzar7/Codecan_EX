import { debounce } from "lodash";
import { useTranslation } from "next-i18next";
import { memo, useEffect, useState } from "react";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeading,
  PopoverTrigger,
} from "@/components/elements/addons/popover/Popover";
import useMarketStore from "@/stores/trade/market";
import { useOrderStore } from "@/stores/trade/order";
import $fetch from "@/utils/api";
import { AiInvestmentInput } from "./AiInvestmentInput";
import { CompactOrderInput } from "./CompactOrderInput";
import type { OrderProps } from "./Order.types";
import { OrderInput } from "./OrderInput";

const OrderBase = ({}: OrderProps) => {
  const { t } = useTranslation();
  const { fetchWallets, setAiPlans } = useOrderStore();
  const { market } = useMarketStore();
  const [mainTab, setMainTab] = useState("SPOT");
  const [subTab, setSubTab] = useState("MARKET");
  const debouncedFetchWallets = debounce(fetchWallets, 100);
  useEffect(() => {
    if (market) {
      debouncedFetchWallets(
        market.isEco,
        market?.currency,
        market?.pair,
        (market as any)?.isTwd
      );
    }
  }, [market]);
  const fetchAiInvestments = async () => {
    const { data, error } = await $fetch({
      url: "/api/ext/ai/investment/plan",
      silent: true,
    });
    if (!error) {
      setAiPlans(data as any[]);
    }
  };
  useEffect(() => {
    if (mainTab === "AI_INVESTMENT") {
      fetchAiInvestments();
    }
  }, [mainTab]);
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex gap-2 border-muted-200 border-b md:overflow-x-auto dark:border-muted-800">
        <button
          className={`shrink-0 border-b-2 px-6 py-2 text-sm transition-colors duration-300 ${
            mainTab === "SPOT"
              ? "border-warning-500 text-warning-500 dark:text-warning-400"
              : "border-transparent text-muted-400 hover:text-muted-500 dark:text-muted-600 dark:hover:text-muted-500"
          }
                    `}
          onClick={() => {
            setMainTab("SPOT");
            setSubTab("MARKET");
          }}
          type="button"
        >
          <span>{t("Spot")}</span>
        </button>
        <button
          className={`shrink-0 border-b-2 px-6 py-2 text-sm transition-colors duration-300 ${
            mainTab === "GRID"
              ? "border-warning-500 text-warning-500 dark:text-warning-400"
              : "border-transparent text-muted-400 hover:text-muted-500 dark:text-muted-600 dark:hover:text-muted-500"
          }
                    `}
          disabled
          onClick={() => {
            setMainTab("GRID");
            setSubTab("AI");
          }}
          type="button"
        >
          <span>
            {t("Grid")} ({t("Soon")})
          </span>
        </button>
        {/* AI Investment */}
        <button
          className={`shrink-0 border-b-2 px-6 py-2 text-sm transition-colors duration-300 ${
            mainTab === "AI_INVESTMENT"
              ? "border-warning-500 text-warning-500 dark:text-warning-400"
              : "border-transparent text-muted-400 hover:text-muted-500 dark:text-muted-600 dark:hover:text-muted-500"
          }
                    `}
          onClick={() => {
            setMainTab("AI_INVESTMENT");
            setSubTab("AI_INVESTMENT");
          }}
          type="button"
        >
          <span>{t("AI Investment")}</span>
        </button>
      </div>
      <div className="flex h-full w-full flex-col p-4">
        {mainTab === "SPOT" && (
          <div className="flex gap-2 rounded-xs border border-muted-200 p-1 dark:border-muted-800">
            <Popover placement="top">
              <PopoverTrigger>
                <button
                  className={`shrink-0 px-3 py-1 text-sm transition-colors duration-300 ${
                    subTab === "MARKET"
                      ? "text-warning-500 dark:text-warning-400"
                      : "text-muted-400 hover:text-muted-500 dark:text-muted-600 dark:hover:text-muted-500"
                  }
                      `}
                  onClick={() => setSubTab("MARKET")}
                  type="button"
                >
                  <span>{t("Market")}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="relative z-50 flex w-72 gap-2 rounded-lg border border-muted-200 bg-white p-4 shadow-muted-300/30 shadow-xl dark:border-muted-700 dark:bg-muted-800 dark:shadow-muted-800/20">
                <div className="pe-3">
                  <PopoverHeading className="mb-1 font-medium font-sans text-muted-800 text-sm dark:text-muted-100">
                    {t("Market Order")}
                  </PopoverHeading>
                  <PopoverDescription className="font-sans text-muted-500 text-xs leading-tight dark:text-muted-400">
                    {t(
                      "A market order is an instruction to buy or sell an asset immediately (at the market\u2019s current price), while a limit order is an instruction to wait until the price hits a specific or better price before being executed."
                    )}
                  </PopoverDescription>
                </div>
                <PopoverClose className="absolute top-4 right-4 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-muted-400 transition-colors duration-300 hover:bg-muted-100 hover:text-muted-800 dark:hover:bg-muted-700 dark:hover:text-muted-100" />
              </PopoverContent>
            </Popover>

            <Popover placement="top">
              <PopoverTrigger>
                <button
                  className={`shrink-0 px-3 py-1 text-sm transition-colors duration-300 ${
                    subTab === "LIMIT"
                      ? "text-warning-500 dark:text-warning-400"
                      : "text-muted-400 hover:text-muted-500 dark:text-muted-600 dark:hover:text-muted-500"
                  }
                      `}
                  onClick={() => setSubTab("LIMIT")}
                  type="button"
                >
                  {t("Limit")}
                </button>
              </PopoverTrigger>
              <PopoverContent className="relative z-50 flex w-72 gap-2 rounded-lg border border-muted-200 bg-white p-4 shadow-muted-300/30 shadow-xl dark:border-muted-700 dark:bg-muted-800 dark:shadow-muted-800/20">
                <div className="pe-3">
                  <PopoverHeading className="mb-1 font-medium font-sans text-muted-800 text-sm dark:text-muted-100">
                    {t("Limit Order")}
                  </PopoverHeading>
                  <PopoverDescription className="font-sans text-muted-500 text-xs leading-tight dark:text-muted-400">
                    {t(
                      "A limit order is an order you place on the order book with a specific limit price. It will only be executed if the market price reaches your limit price (or better). You may use limit orders to buy an asset at a lower price or sell at a higher price than the current market price."
                    )}
                  </PopoverDescription>
                </div>
                <PopoverClose className="absolute top-4 right-4 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-muted-400 transition-colors duration-300 hover:bg-muted-100 hover:text-muted-800 dark:hover:bg-muted-700 dark:hover:text-muted-100" />
              </PopoverContent>
            </Popover>
            <button
              className={`shrink-0 px-3 py-1 text-sm transition-colors duration-300 ${
                subTab === "STOPLIMIT"
                  ? "text-warning-500 dark:text-warning-400"
                  : "text-muted-400 hover:text-muted-500 dark:text-muted-600 dark:hover:text-muted-500"
              }
                      `}
              disabled
              onClick={() => setSubTab("STOPLIMIT")}
              type="button"
            >
              <span>
                {t("Stop Limit")} ({t("Soon")})
              </span>
            </button>
          </div>
        )}
        <div className="h-full w-full">
          {mainTab === "SPOT" && (
            <>
              <div className="hidden h-full w-full flex-col gap-5 pt-4 sm:flex sm:flex-row md:gap-10">
                <OrderInput side={"BUY"} type={subTab} />
                <OrderInput side={"SELL"} type={subTab} />
              </div>
              <div className="flex h-full w-full flex-col gap-4 pt-4 sm:hidden">
                <CompactOrderInput type={subTab} />
              </div>
            </>
          )}
          {mainTab === "GRID" && (
            <>
              <div className="hidden h-full w-full flex-col gap-5 pt-4 sm:flex sm:flex-row md:gap-10" />
              <div className="flex h-full w-full flex-col gap-4 pt-4 sm:hidden" />
            </>
          )}

          {mainTab === "AI_INVESTMENT" && <AiInvestmentInput />}
        </div>
      </div>
    </div>
  );
};
export const Order = memo(OrderBase);

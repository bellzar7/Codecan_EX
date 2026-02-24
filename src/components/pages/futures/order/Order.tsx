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
import useFuturesMarketStore from "@/stores/futures/market";
import { useFuturesOrderStore } from "@/stores/futures/order";
import { CompactOrderInput } from "./CompactOrderInput";
import type { OrderProps } from "./Order.types";
import { OrderInput } from "./OrderInput";

const OrderBase = ({}: OrderProps) => {
  const { t } = useTranslation();
  const { fetchWallet } = useFuturesOrderStore();
  const { market } = useFuturesMarketStore();
  const [subTab, setSubTab] = useState("MARKET");
  const debouncedFetchWallet = debounce(fetchWallet, 100);

  useEffect(() => {
    if (market) {
      debouncedFetchWallet("FUTURES", market.pair);
    }
  }, [market]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="overflow-y-hidden border-muted-200 border-b md:overflow-x-auto dark:border-muted-800">
        <div className="flex min-h-[36px] gap-2">
          <Popover placement="top">
            <PopoverTrigger>
              <button
                className={`shrink-0 border-b-2 px-6 py-2 text-sm transition-colors duration-300 ${
                  subTab === "MARKET"
                    ? "border-warning-500 text-warning-500 dark:text-warning-400"
                    : "border-transparent text-muted-400 hover:text-muted-500 dark:text-muted-600 dark:hover:text-muted-500"
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
                    "A market order is an instruction to buy or sell a futures contract immediately (at the market\u2019s current price), while a limit order is an instruction to wait until the price hits a specific or better price before being executed."
                  )}
                </PopoverDescription>
              </div>
              <PopoverClose className="absolute top-4 right-4 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-muted-400 transition-colors duration-300 hover:bg-muted-100 hover:text-muted-800 dark:hover:bg-muted-700 dark:hover:text-muted-100" />
            </PopoverContent>
          </Popover>
          <Popover placement="top">
            <PopoverTrigger>
              <button
                className={`shrink-0 border-b-2 px-6 py-2 text-sm transition-colors duration-300 ${
                  subTab === "LIMIT"
                    ? "border-warning-500 text-warning-500 dark:text-warning-400"
                    : "border-transparent text-muted-400 hover:text-muted-500 dark:text-muted-600 dark:hover:text-muted-500"
                }
                      `}
                onClick={() => setSubTab("LIMIT")}
                type="button"
              >
                <span>{t("Limit")}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="relative z-50 flex w-72 gap-2 rounded-lg border border-muted-200 bg-white p-4 shadow-muted-300/30 shadow-xl dark:border-muted-700 dark:bg-muted-800 dark:shadow-muted-800/20">
              <div className="pe-3">
                <PopoverHeading className="mb-1 font-medium font-sans text-muted-800 text-sm dark:text-muted-100">
                  {t("Limit Order")}
                </PopoverHeading>
                <PopoverDescription className="font-sans text-muted-500 text-xs leading-tight dark:text-muted-400">
                  {t(
                    "A limit order is an order you place on the order book with a specific limit price. It will only be executed if the market price reaches your limit price (or better). You may use limit orders to buy a futures contract at a lower price or sell at a higher price than the current market price."
                  )}
                </PopoverDescription>
              </div>
              <PopoverClose className="absolute top-4 right-4 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-muted-400 transition-colors duration-300 hover:bg-muted-100 hover:text-muted-800 dark:hover:bg-muted-700 dark:hover:text-muted-100" />
            </PopoverContent>
          </Popover>
          <Popover placement="top">
            {/*<PopoverTrigger>*/}
            {/*  <button*/}
            {/*    type="button"*/}
            {/*    className={`shrink-0 border-b-2 px-6 py-2 text-sm transition-colors duration-300*/}
            {/*            ${*/}
            {/*              subTab === "STOPLIMIT"*/}
            {/*                ? "border-warning-500 text-warning-500 dark:text-warning-400"*/}
            {/*                : "border-transparent text-muted-400 hover:text-muted-500 dark:text-muted-600 dark:hover:text-muted-500"*/}
            {/*            }*/}
            {/*          `}*/}
            {/*    onClick={() => setSubTab("STOPLIMIT")}*/}
            {/*  >*/}
            {/*    <span>{t("Stop Limit")}</span>*/}
            {/*  </button>*/}
            {/*</PopoverTrigger>*/}
            <PopoverContent className="relative z-50 flex w-72 gap-2 rounded-lg border border-muted-200 bg-white p-4 shadow-muted-300/30 shadow-xl dark:border-muted-700 dark:bg-muted-800 dark:shadow-muted-800/20">
              <div className="pe-3">
                <PopoverHeading className="mb-1 font-medium font-sans text-muted-800 text-sm dark:text-muted-100">
                  {t("Stop Limit Order")}
                </PopoverHeading>
                <PopoverDescription className="font-sans text-muted-500 text-xs leading-tight dark:text-muted-400">
                  {t(
                    "A stop limit order combines the features of a stop order and a limit order. It allows you to set a stop price at which the order converts to a limit order and executes at the limit price or better. Use it to manage risk by setting stop prices for taking profit or limiting losses."
                  )}
                </PopoverDescription>
              </div>
              <PopoverClose className="absolute top-4 right-4 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-muted-400 transition-colors duration-300 hover:bg-muted-100 hover:text-muted-800 dark:hover:bg-muted-700 dark:hover:text-muted-100" />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex h-full w-full flex-col p-4">
        <div className="h-full w-full">
          <div className="hidden h-full w-full flex-col gap-5 sm:flex sm:flex-row md:gap-10">
            <OrderInput side={"BUY"} type={subTab} />
            <OrderInput side={"SELL"} type={subTab} />
          </div>
          <div className="flex h-full w-full flex-col gap-4 pt-4 sm:hidden">
            <CompactOrderInput type={subTab} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const Order = memo(OrderBase);

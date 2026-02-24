import { memo } from "react";
import { Chart } from "@/components/pages/futures/chart";
import { Markets } from "@/components/pages/futures/markets";
import { Order } from "@/components/pages/futures/order";
import { Orderbook } from "@/components/pages/futures/orderbook/Orderbook";
import { Orders } from "@/components/pages/futures/orders";
import { Ticker } from "@/components/pages/futures/ticker";
import { Trades } from "@/components/pages/futures/trades";
import Layout from "@/layouts/Nav";
import useFuturesMarketStore from "@/stores/futures/market";

const TradePage = () => {
  const { market } = useFuturesMarketStore();

  return (
    <Layout
      color="muted"
      darker
      horizontal
      title={market?.symbol || "Connecting..."}
    >
      <div className="relative mt-1 mb-5 grid grid-cols-1 gap-1 md:grid-cols-12">
        <div className="col-span-1 grid grid-cols-1 gap-1 md:col-span-12 md:grid-cols-9 lg:col-span-9">
          <div className="order-1 col-span-1 min-h-[8vh] border-thin bg-white md:col-span-9 dark:bg-muted-900">
            <Ticker />
          </div>
          <div className="order-3 col-span-1 min-h-[50vh] border-thin bg-white md:order-2 md:col-span-3 md:min-h-[100vh] dark:bg-muted-900">
            <Orderbook />
          </div>
          <div className="order-2 col-span-1 flex h-full w-full flex-col gap-1 md:order-3 md:col-span-6">
            <div className="h-full min-h-[60vh] border-thin bg-white dark:bg-muted-900">
              <Chart />
            </div>
            <div className="h-full min-h-[40vh] border-thin bg-white dark:bg-muted-900">
              <Order />
            </div>
          </div>
        </div>
        <div className="order-4 col-span-1 flex flex-col gap-1 sm:flex-row md:col-span-12 lg:col-span-3 lg:flex-col">
          <div className="h-full min-h-[55vh] w-full border-thin bg-white dark:bg-muted-900">
            <Markets />
          </div>
          <div className="h-full min-h-[45vh] w-full min-w-[220px] border-thin bg-white dark:bg-muted-900">
            <Trades />
          </div>
        </div>
        <div className="order-5 col-span-1 min-h-[40vh] border-thin bg-white md:col-span-12 dark:bg-muted-900">
          <Orders />
        </div>
      </div>
    </Layout>
  );
};

export default memo(TradePage);

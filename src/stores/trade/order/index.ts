import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import $fetch from "@/utils/api";

type OrderStore = {
  currencyBalance: number;
  pairBalance: number;
  ask: number;
  bid: number;
  ordersTab: "OPEN" | "HISTORY" | "AI";
  orders: Order[];
  openOrders: Order[];
  loading: boolean;
  aiInvestments: any[];
  aiPlans: any[];

  setAiPlans: (plans: any[]) => void;
  setAiInvestments: (investments: any[]) => void;
  fetchAiInvestments: () => void;
  fetchWallets: (
    isEco: boolean,
    currency: string,
    pair: string,
    isTwd?: boolean
  ) => void;
  fetchWallet: (type: string, currency: string) => void;
  fetchOrders: (
    type: boolean,
    currency: string,
    pair: string,
    isTwd?: boolean
  ) => void;
  setAsk: (ask: number) => void;
  setBid: (bid: number) => void;
  placeOrder: (
    isEco: boolean,
    currency: string,
    pair: string,
    orderType: "MARKET" | "LIMIT" | "STOP_LIMIT",
    side: "BUY" | "SELL",
    amount: number,
    price?: number,
    isTwd?: boolean,
    symbol?: string
  ) => Promise<boolean>;
  setOrdersTab: (tab: "OPEN" | "HISTORY" | "AI") => void;
  setOrders: (orders: Order[]) => void;
  setOpenOrders: (openOrders: Order[]) => void;
  cancelOrder: (
    id: string,
    isEco: boolean,
    currency: string,
    pair: string,
    timestamp?: string,
    isTwd?: boolean
  ) => void;
  placeAiInvestmentOrder: (
    planId: string,
    durationId: string,
    market: any,
    amount: number
  ) => void;
  cancelAiInvestmentOrder: (
    id: string,
    isEco: boolean,
    currency: string,
    pair: string
  ) => void;
};

export const useOrderStore = create<OrderStore>()(
  immer((set, get) => ({
    currencyBalance: 0,
    pairBalance: 0,
    ask: 0,
    bid: 0,
    ordersTab: "OPEN",
    orders: [],
    openOrders: [],
    loading: false,

    setOrdersTab: (tab: "OPEN" | "HISTORY" | "AI") => {
      set((state) => {
        state.ordersTab = tab;
      });
    },

    fetchWallets: async (
      isEco: boolean,
      currency: string,
      pair: string,
      isTwd?: boolean
    ) => {
      set((state) => {
        state.loading = true;
      });

      // TWD now uses SPOT wallets (same as Binance) after wallet unification
      // For EUR/USD: currency=EUR (base), pair=USD (quote)
      // BUY needs quote wallet (USD), SELL needs base wallet (EUR)
      const walletType = isTwd ? "SPOT" : isEco ? "ECO" : "SPOT";

      const { data, error } = await $fetch({
        url: "/api/finance/wallet/symbol",
        silent: true,
        params: { type: walletType, currency, pair },
      });

      if (!error && data) {
        const balanceData = data as any;
        set((state) => {
          state.currencyBalance = balanceData.CURRENCY || 0;
          state.pairBalance = balanceData.PAIR || 0;
        });
      } else {
        // If wallet doesn't exist, show 0 balance
        set((state) => {
          state.currencyBalance = 0;
          state.pairBalance = 0;
        });
      }

      set((state) => {
        state.loading = false;
      });
    },

    fetchWallet: async (type: string, currency: string) => {
      set((state) => {
        state.loading = true;
      });
      const { data, error } = await $fetch({
        url: `/api/finance/wallet/${type}/${currency}`,
        silent: true,
      });

      if (!error) {
        const walletData = data as any;
        set((state) => {
          if (type === "currency") {
            state.currencyBalance = walletData;
          } else if (type === "pair") {
            state.pairBalance = walletData;
          }
        });
      }

      set((state) => {
        state.loading = false;
      });
    },

    fetchOrders: async (
      isEco: boolean,
      currency: string,
      pair: string,
      isTwd?: boolean
    ) => {
      set((state) => {
        state.loading = true;
      });

      const { ordersTab } = get();

      let url = isEco ? "/api/ext/ecosystem/order" : "/api/exchange/order";
      let params: any = { currency, pair, type: ordersTab };

      if (isTwd) {
        url = "/api/ext/twd/order";
        params = { status: ordersTab === "OPEN" ? "OPEN" : "CLOSED" };
      }

      const { data, error } = await $fetch({
        url,
        params,
        silent: true,
      });

      if (!error) {
        const ordersData = data as any;
        set((state) => {
          state[ordersTab === "OPEN" ? "openOrders" : "orders"] =
            ordersData || [];
        });
      }

      set((state) => {
        state.loading = false;
      });
    },

    setAsk: (ask: number) => {
      set((state) => {
        state.ask = Number(ask);
      });
    },

    setBid: (bid: number) => {
      set((state) => {
        state.bid = Number(bid);
      });
    },

    placeOrder: async (
      isEco: boolean,
      currency: string,
      pair: string,
      orderType: "MARKET" | "LIMIT" | "STOP_LIMIT",
      side: "BUY" | "SELL",
      amount: number,
      price?: number,
      isTwd?: boolean,
      symbol?: string
    ) => {
      set((state) => {
        state.loading = true;
      });

      const { fetchOrders, fetchWallets } = get();
      let url = isEco ? "/api/ext/ecosystem/order" : "/api/exchange/order";
      let body: any = {
        currency,
        pair,
        amount,
        type: orderType,
        side,
        price:
          orderType === "MARKET"
            ? side === "BUY"
              ? get().ask
              : get().bid
            : Number(price),
      };

      if (isTwd && symbol) {
        url = "/api/ext/twd/order";
        body = {
          symbol,
          amount,
          type: orderType,
          side,
          price: orderType === "LIMIT" ? Number(price) : undefined,
        };
      }

      try {
        const { error } = await $fetch({
          url,
          method: "POST",
          body,
        });

        if (!error) {
          await fetchWallets(isEco, currency, pair, isTwd);
          await fetchOrders(isEco, currency, pair, isTwd);

          return true;
        }
      } catch (error) {
        console.error("Failed to place order:", error);
        throw error;
      } finally {
        set((state) => {
          state.loading = false;
        });
      }

      return false;
    },

    setOrders: (orders: Order[]) => {
      set((state) => {
        state.orders = orders;
      });
    },

    setOpenOrders: (openOrders: Order[]) => {
      set((state) => {
        state.openOrders = openOrders;
      });
    },

    cancelOrder: async (
      id: string,
      isEco: boolean,
      currency: string,
      pair: string,
      timestamp?: string,
      isTwd?: boolean
    ) => {
      set((state) => {
        state.loading = true;
      });
      const { fetchWallets } = get();

      let url = isEco
        ? `/api/ext/ecosystem/order/${id}?timestamp=${timestamp}`
        : `/api/exchange/order/${id}`;

      if (isTwd) {
        url = `/api/ext/twd/order/${id}`;
      }

      const { error } = await $fetch({
        url,
        method: "DELETE",
      });

      if (!error) {
        set((state) => {
          state.openOrders = state.openOrders.filter(
            (order) => order.id !== id
          );
        });
        fetchWallets(isEco, currency, pair, isTwd);
      }

      set((state) => {
        state.loading = false;
      });
    },

    aiInvestments: [],
    aiPlans: [],

    setAiPlans: (plans: any[]) => {
      set((state) => {
        state.aiPlans = plans;
      });
    },

    setAiInvestments: (investments: any[]) => {
      set((state) => {
        state.aiInvestments = investments;
      });
    },

    fetchAiInvestments: async () => {
      const { data, error } = await $fetch({
        url: "/api/ext/ai/investment/log",
        silent: true,
      });

      if (!error) {
        set((state) => {
          state.aiInvestments = data as any;
        });
      }
    },

    placeAiInvestmentOrder: async (
      planId: string,
      durationId: string,
      market: any,
      amount: number
    ) => {
      set((state) => {
        state.loading = true;
      });

      const { fetchWallets, fetchAiInvestments } = get();
      const { error } = await $fetch({
        url: "/api/ext/ai/investment/log",
        method: "POST",
        body: {
          planId,
          durationId,
          amount,
          currency: market.currency,
          pair: market.pair,
          type: market.isEco ? "ECO" : "SPOT",
        },
      });

      if (!error) {
        await fetchWallets(market.isEco, market.currency, market.pair);
        await fetchAiInvestments();
      }

      set((state) => {
        state.loading = false;
      });
    },

    cancelAiInvestmentOrder: async (
      id: string,
      isEco: boolean,
      currency: string,
      pair: string
    ) => {
      set((state) => {
        state.loading = true;
      });

      const { fetchWallets } = get();
      const { error } = await $fetch({
        url: `/api/ext/ai/investment/log/${id}`,
        method: "DELETE",
      });

      if (!error) {
        await fetchWallets(isEco, currency, pair);
        set((state) => {
          state.aiInvestments = state.aiInvestments.filter(
            (investment) => investment.id !== id
          );
        });
      }

      set((state) => {
        state.loading = false;
      });
    },
  }))
);

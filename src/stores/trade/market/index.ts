import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import $fetch from "@/utils/api";

interface MarketState {
  // biome-ignore lint/suspicious/noExplicitAny: Market data structure is dynamic based on exchange provider
  market: any;
  searchQuery: string;
  // biome-ignore lint/suspicious/noExplicitAny: Market data structure is dynamic based on exchange provider
  marketData: any[];
  // biome-ignore lint/suspicious/noExplicitAny: Watchlist data structure is dynamic
  watchlistData: any[];
  selectedPair: string;
  marketReady: boolean;
  watchlistReady: boolean;
  pairs: string[];
  priceChangeData: Record<string, { price: number; change: number }>;
  withEco: boolean;

  setSearchQuery: (query: string) => void;
  // biome-ignore lint/suspicious/noExplicitAny: Market data structure is dynamic
  setMarketData: (data: any[]) => void;
  setMarket: (symbol: string) => void;
  setExternalTwdMarket: (symbol: string) => void;
  setExternalCryptoMarket: (symbol: string) => void;
  // biome-ignore lint/suspicious/noExplicitAny: Watchlist data structure is dynamic
  setWatchlistData: (data: any[]) => void;
  setSelectedPair: (pair: string) => void;
  fetchData: (params?: { currency?: string; pair?: string }) => Promise<void>;
  // biome-ignore lint/suspicious/noExplicitAny: Market data structure is dynamic
  fetchWatchlist: (markets: any[]) => Promise<void>;
  toggleWatchlist: (symbol: string) => Promise<void>;
  setPriceChangeData: (symbol: string, price: number, change: number) => void;
  getPrecisionBySymbol: (symbol: string) => { price: number; amount: number };
  setWithEco: (status: boolean) => void;
  getFirstAvailablePair: () => string;
}

const useMarketStoreBase = create<MarketState>()(
  immer((set, get) => ({
    market: null,
    searchQuery: "",
    marketData: [],
    watchlistData: [],
    selectedPair: "",
    marketReady: false,
    watchlistReady: false,
    pairs: [],
    priceChangeData: {},
    withEco: true,

    setWithEco: (status) =>
      set((state) => {
        state.withEco = status;
      }),

    setPriceChangeData: (symbol, price, change) =>
      set((state) => {
        state.priceChangeData[symbol] = { price, change };
      }),

    getPrecisionBySymbol: (symbol) => {
      const { marketData } = get();
      const market = marketData.find((m) => m.symbol === symbol);
      return market ? market.precision : { price: 8, amount: 8 };
    },

    setSearchQuery: (query) =>
      set((state) => {
        state.searchQuery = query;
      }),

    setMarketData: (data) =>
      set((state) => {
        const updatedMarketData = state.marketData.map((item) => {
          const update = data.find((d) => d.symbol === item.symbol);
          return update ? { ...item, ...update } : item;
        });

        const newMarketData = data.filter(
          (item) => !state.marketData.some((m) => m.symbol === item.symbol)
        );

        state.marketData = [...updatedMarketData, ...newMarketData];
        state.pairs = [
          ...new Set([...state.pairs, ...data.map((item) => item.pair)]),
        ];
      }),

    setWatchlistData: (data) =>
      set((state) => {
        state.watchlistData = data;
      }),

    setSelectedPair: (pair) =>
      set((state) => {
        state.selectedPair = pair;
      }),

    fetchData: async (params) => {
      const { fetchWatchlist, withEco } = get();
      const { currency, pair } = params || {};
      const { data, error } = await $fetch({
        url: `/api/exchange/market?eco=${withEco}`,
        silent: true,
      });
      if (!error) {
        // biome-ignore lint/suspicious/noExplicitAny: API response structure is dynamic
        const marketsData = data as any;
        // biome-ignore lint/suspicious/noExplicitAny: API response item structure is dynamic
        const markets = marketsData.map((item: any) => ({
          id: item.id,
          symbol: `${item.currency}/${item.pair}`,
          currency: item.currency,
          pair: item.pair,
          precision: item.metadata?.precision,
          limits: item.metadata?.limits,
          isEco: item.isEco,
          icon: item.icon,
        }));

        set((state) => {
          const updatedMarketData = state.marketData.map((item) => {
            const update = markets.find((m) => m.symbol === item.symbol);
            return update ? { ...item, ...update } : item;
          });

          const newMarketData = markets.filter(
            (item) => !state.marketData.some((m) => m.symbol === item.symbol)
          );

          state.marketData = [...updatedMarketData, ...newMarketData];
          state.pairs = [
            ...new Set([...state.pairs, ...markets.map((item) => item.pair)]),
          ];

          if (currency && pair) {
            const market = markets.find(
              (item) => item.symbol === `${currency}/${pair}`
            );

            state.selectedPair = pair;
            if (market) {
              state.market = market;
            }
          }
        });

        await fetchWatchlist(markets);
        set({ watchlistReady: true });
      }
    },

    getFirstAvailablePair: () => {
      const { marketData } = get();
      // Modify this to include your logic for selecting an available pair
      const availablePairs = marketData.filter((pair) => !pair.isEco);

      return availablePairs[0]?.symbol?.replace("/", "_");
    },

    setMarket: (symbol) => {
      const { marketData } = get();
      const market = marketData.find((m) => m.symbol === symbol);
      set((state) => {
        state.market = market;
      });
    },

    fetchWatchlist: async (markets) => {
      const { withEco } = get();
      const { data, error } = await $fetch({
        url: "/api/exchange/watchlist",
        silent: true,
      });
      if (!error) {
        // biome-ignore lint/suspicious/noExplicitAny: API response structure is dynamic
        const watchlistData = data as any;
        const watchlist = watchlistData
          // biome-ignore lint/suspicious/noExplicitAny: Watchlist item structure is dynamic
          .map((item: any) =>
            // biome-ignore lint/suspicious/noExplicitAny: Market structure is dynamic
            markets.find((m: any) => m.symbol === item.symbol)
          )
          // biome-ignore lint/suspicious/noExplicitAny: Watchlist item structure is dynamic
          .filter((item: any) => item && (withEco ? true : !item.isEco));
        set((state) => {
          state.watchlistData = watchlist;
        });
      }
    },

    toggleWatchlist: async (symbol) => {
      const { fetchWatchlist, marketData } = get();
      const { error } = await $fetch({
        url: "/api/exchange/watchlist",
        method: "POST",
        body: { type: "TRADE", symbol },
      });
      if (!error) {
        await fetchWatchlist(marketData);
      }
    },

    setExternalTwdMarket: (symbol: string) =>
      set((state) => {
        state.market = {
          id: `twd:${symbol}`,
          symbol,
          currency: symbol.split("/")[0] || symbol,
          pair: symbol.split("/")[1] || "",
          isEco: true,
          isTwd: true,
          precision: { price: 6, amount: 4 },
          limits: {},
          icon: null,
          // biome-ignore lint/suspicious/noExplicitAny: Dynamic market structure
        } as any;
      }),

    // For crypto pairs not in database - use Binance/CCXT, NOT TwelveData
    setExternalCryptoMarket: (symbol: string) =>
      set((state) => {
        state.market = {
          id: `crypto:${symbol}`,
          symbol,
          currency: symbol.split("/")[0] || symbol,
          pair: symbol.split("/")[1] || "",
          isEco: false,
          isTwd: false,
          precision: { price: 8, amount: 8 },
          limits: {},
          icon: null,
          // biome-ignore lint/suspicious/noExplicitAny: Dynamic market structure
        } as any;
      }),
  }))
);

const useMarketStore = useMarketStoreBase as typeof useMarketStoreBase &
  (<T>(
    selector: (state: MarketState) => T,
    equalityFn?: (a: T, b: T) => boolean
  ) => T);

export default useMarketStore;

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import $fetch from "@/utils/api";

type Wallet = {
  id: string;
  type: string;
  currency: string;
  balance: number;
  transactions: any[];
  address: string;
};

type WalletStore = {
  wallet: Wallet | null;
  fiatWallets: Wallet[];
  spotWallets: Wallet[];
  ecoWallets: Wallet[];
  futuresWallets: Wallet[];
  pnl: {
    today: number;
    yesterday: number;
    chart: any[];
  } | null;
  fetchWallets: () => void;
  fetchPnl: () => void;
  fetchWallet: (type: string, currency: string) => void;
  setWallet: (wallet: Wallet | null) => void;
};

export const useWalletStore = create<WalletStore>()(
  immer((set, get) => ({
    wallet: null,
    fiatWallets: [],
    spotWallets: [],
    ecoWallets: [],
    futuresWallets: [],
    pnl: null,

    fetchWallets: async () => {
      const { data, error } = await $fetch({
        url: "/api/finance/wallet",
        silent: true,
      });

      if (!error) {
        const walletsData = data as any;
        set((state) => {
          state.fiatWallets = walletsData.FIAT;
          state.spotWallets = walletsData.SPOT;
          state.ecoWallets = walletsData.ECO;
          state.futuresWallets = walletsData.FUTURES;
        });
      }
    },

    fetchPnl: async () => {
      const { pnl } = get();
      if (pnl) return;

      const { data, error } = await $fetch({
        url: "/api/finance/wallet?pnl=true",
        silent: true,
      });

      if (!error && data) {
        set((state) => {
          state.pnl = data as any;
        });
      }
    },

    fetchWallet: async (type: string, currency: string) => {
      const { data, error } = await $fetch({
        url: `/api/finance/wallet/${type}/${currency}`,
        silent: true,
      });

      if (!error) {
        set((state) => {
          state.wallet = data as any;
        });
      }
    },

    setWallet: (wallet: Wallet) => {
      set((state) => {
        state.wallet = wallet;
      });
    },
  }))
);

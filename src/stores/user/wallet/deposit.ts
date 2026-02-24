import { toast } from "sonner";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { useDashboardStore } from "@/stores/dashboard";
import $fetch from "@/utils/api";

type WalletType = {
  value: string;
  label: string;
};

type Currency = any;

type DepositStore = {
  step: number;
  walletTypes: WalletType[];
  selectedWalletType: WalletType;
  currencies: Currency[];
  selectedCurrency: string;
  depositMethods: any;
  selectedDepositMethod: any | null;
  depositAddress: any;
  depositAmount: number;
  loading: boolean;
  deposit: any;
  stripeListener: boolean;
  transactionHash: string;
  transactionSent: boolean;
  contractType: string | null;

  setStep: (step: number) => void;
  setSelectedWalletType: (walletType: WalletType) => void;
  setSelectedCurrency: (currency: string) => void;
  setDepositMethods: (methods: any[]) => void;
  setSelectedDepositMethod: (
    method: any | null,
    contractType: string | null
  ) => void;
  setDepositAmount: (amount: number) => void;
  stripeDeposit: () => void;
  paypalDeposit: () => void;
  handleFiatDeposit: (values) => void;
  fetchCurrencies: () => void;
  fetchDepositAddress: () => void;
  fetchDepositMethods: () => void;
  setDeposit: (deposit: any) => void;
  clearAll: () => void;
  stopStripeListener: () => void;
  verifySession: (sessionId: string) => void;
  setTransactionHash: (hash: string) => void;
  sendTransactionHash: () => void;
  unlockAddress: (address: string) => void;
  setLoading: (loading: boolean) => void;
  initializeWalletTypes: () => void;
};

const endpoint = "/api/finance";

export const useDepositStore = create<DepositStore>()(
  immer((set, get) => ({
    step: 1,
    walletTypes: [],
    selectedWalletType: { value: "SPOT", label: "Spot" },
    currencies: [],
    selectedCurrency: "Select a currency",
    depositMethods: [],
    selectedDepositMethod: null,
    depositAddress: "",
    depositAmount: 0,
    loading: false,
    deposit: null,
    stripeListener: false,
    transactionHash: "",
    transactionSent: false,
    contractType: null,

    initializeWalletTypes: () => {
      const { getSetting } = useDashboardStore.getState();
      const fiatWalletsEnabled = getSetting("fiatWallets") === "true";

      // Only wallet types that support direct deposit are included here:
      // - SPOT: Always available for crypto deposits
      // - FIAT: Available when fiat wallets are enabled
      //
      // NOT included (transfer-only):
      // - ECO (Funding): Must be funded via transfer from FIAT or SPOT
      // - FUTURES, FOREX, STOCK, INDEX: Internal trading wallets (transfer-only)
      const walletTypes = [{ value: "SPOT", label: "Spot" }];

      // FIAT - supports deposit if fiat wallets are enabled
      if (fiatWalletsEnabled) {
        walletTypes.unshift({ value: "FIAT", label: "Fiat" });
      }

      set((state) => {
        state.walletTypes = walletTypes;
      });
    },

    setStep: (step) =>
      set((state) => {
        state.step = step;
      }),
    setSelectedWalletType: (walletType) =>
      set((state) => {
        state.selectedWalletType = walletType;
      }),
    setSelectedCurrency: (currency) =>
      set((state) => {
        state.selectedCurrency = currency;
      }),
    setDepositMethods: (methods) => {
      set((state) => {
        state.depositMethods = methods;
      });
    },
    unlockAddress: async (address) => {
      await $fetch({
        url: `/api/ext/ecosystem/deposit/unlock?address=${address}`,
        silent: true,
      });
    },
    setSelectedDepositMethod: async (method, newContractType) => {
      set((state) => {
        state.selectedDepositMethod = method;
        state.contractType = newContractType;
      });
    },
    setDepositAmount: (amount) =>
      set((state) => {
        state.depositAmount = amount;
      }),

    setDeposit: (deposit) =>
      set((state) => {
        state.deposit = deposit;
      }),

    setTransactionHash: (hash) =>
      set((state) => {
        state.transactionHash = hash;
      }),

    setLoading: (loading) =>
      set((state) => {
        state.loading = loading;
      }),

    stripeDeposit: async () => {
      set((state) => {
        state.loading = true;
        state.stripeListener = true;
      });

      const { depositAmount, selectedCurrency, verifySession } = get();
      const { data, error } = await $fetch({
        url: `${endpoint}/deposit/fiat/stripe`,
        method: "POST",
        silent: true,
        body: {
          amount: depositAmount,
          currency: selectedCurrency,
        },
      });

      set((state) => {
        state.loading = false;
      });

      const paymentData = data as any;
      if (!error && paymentData.url) {
        const stripePopup = window.open(
          paymentData.url,
          "stripePopup",
          "width=500,height=700"
        );
        if (!stripePopup) {
          toast.error("Popup blocked or failed to open.");
          set((state) => {
            state.stripeListener = false;
          });
          return;
        }

        // Define the message handler function
        const messageHandler = (event) => {
          if (event.origin === window.location.origin) {
            if (event.data.sessionId) {
              verifySession(event.data.sessionId);
            } else if (event.data.status === "canceled") {
              set((state) => {
                state.stripeListener = false;
              });
              toast.error("Payment was canceled by the user");
            }
          }
        };

        window.addEventListener("message", messageHandler);

        // Check if the popup window is closed
        const checkPopup = setInterval(() => {
          if (!stripePopup || stripePopup.closed) {
            clearInterval(checkPopup);
            window.removeEventListener("message", messageHandler);
            set((state) => {
              state.stripeListener = false;
            });
          }
        }, 500);
      } else {
        set((state) => {
          state.stripeListener = false;
        });
        toast.error(error || "An unexpected error occurred");
      }
    },

    stopStripeListener: () => {
      set((state) => {
        state.stripeListener = false;
      });
    },

    verifySession: async (sessionId) => {
      try {
        const { data, error } = await $fetch({
          url: "/api/finance/deposit/fiat/stripe/verify",
          method: "POST",
          silent: true,
          params: { sessionId },
        });

        if (error) {
          toast.error(
            error || "An unexpected error occurred during payment verification"
          );
        } else {
          useDepositStore.getState().setDeposit(data);
          useDepositStore.getState().setStep(5);
        }
      } catch (error) {
        console.error("Error in fetching payment status:", error);
        toast.error(
          "Error in communication with payment verification endpoint"
        );
      }
    },

    paypalDeposit: async () => {
      const { depositAmount, selectedCurrency } = get();
      const { error } = await $fetch({
        url: `${endpoint}/deposit/fiat/paypal`,
        method: "POST",
        silent: true,
        body: {
          amount: depositAmount,
          currency: selectedCurrency,
        },
      });

      if (error) {
        toast.error(error || "An unexpected error occurred");
      } else {
        set((state) => {
          state.step = 5;
        });
      }
    },

    handleFiatDeposit: async (values) => {
      const { selectedDepositMethod, depositAmount, selectedCurrency } = get();
      if (
        !(selectedDepositMethod && depositAmount && selectedCurrency) ||
        depositAmount <= 0 ||
        depositAmount < selectedDepositMethod.minAmount
      ) {
        toast.error("Invalid deposit amount");
        return;
      }
      if (selectedDepositMethod?.alias === "stripe") {
        return get().stripeDeposit();
      }
      if (selectedDepositMethod?.alias === "paypal") {
        return get().paypalDeposit();
      }

      try {
        const { data, error } = await $fetch({
          url: `${endpoint}/deposit/fiat`,
          method: "POST",
          silent: true,
          body: {
            amount: depositAmount,
            currency: selectedCurrency,
            methodId: selectedDepositMethod?.id,
            customFields: values,
          },
        });

        if (error) {
          toast.error(error || "An unexpected error occurred");
        } else {
          set((state) => {
            state.deposit = data;
            state.step = 5;
          });
        }
      } catch (error) {
        console.error("Error in fiat deposit:", error);
        toast.error("An error occurred while processing deposit");
      }
    },

    fetchCurrencies: async () => {
      const { selectedWalletType } = get();
      try {
        console.log("selectedWalletType for currencies", selectedWalletType);
        const { data, error } = await $fetch({
          url: `${endpoint}/currency?action=deposit&walletType=${selectedWalletType.value}`,
          silent: true,
        });

        if (error) {
          toast.error(error);
          set((state) => {
            state.step = 1;
          });
        } else {
          set((state) => {
            state.currencies = data as any;
            state.step = 2;
          });
        }
      } catch (error) {
        console.error("Error in fetching currencies:", error);
        toast.error(error);
      }
    },

    fetchDepositMethods: async () => {
      console.log("[DepositStore] Fetching deposit methods...");
      console.log("endpoint", endpoint);

      const { selectedWalletType, selectedCurrency } = get();
      try {
        console.log("[DepositStore] Request params:", {
          selectedWalletType,
          selectedCurrency,
        });
        const { data, error } = await $fetch({
          url: `${endpoint}/currency/${selectedWalletType.value}/${selectedCurrency}?action=deposit`,
          silent: true,
        });

        if (error) {
          toast.error(
            "An error occurred while fetching currency deposit methods"
          );
          set((state) => {
            state.step = 3;
          });
        } else {
          const methodsData = data as any;
          // change limits in methods to object from json string if it is a string
          if (methodsData && methodsData.length > 0) {
            methodsData.forEach((method) => {
              if (typeof method.limits === "string") {
                method.limits = JSON.parse(method.limits);
              }
            });
          }

          set((state) => {
            state.depositMethods = methodsData;
            state.step = 3;
          });
          console.log("[DepositStore] Deposit methods loaded:", {
            count: methodsData?.length || 0,
            methods: methodsData?.map((m: any) => m.chain) || [],
          });
        }
      } catch (error) {
        console.error("Error in fetching deposit methods:", error);
        toast.error("An error occurred while fetching deposit methods");
      }
    },

    fetchDepositAddress: async () => {
      const { selectedWalletType, selectedCurrency, selectedDepositMethod } =
        get();

      console.log("=== [DepositStore] fetchDepositAddress START ===");
      console.log("[DepositStore] Checking for custom addresses...");

      // 🔍 DETAILED DEBUG: Log parameters with types
      console.log(
        "[DepositStore DEBUG] selectedCurrency:",
        selectedCurrency,
        typeof selectedCurrency
      );
      console.log(
        "[DepositStore DEBUG] selectedDepositMethod:",
        selectedDepositMethod,
        typeof selectedDepositMethod
      );
      console.log(
        "[DepositStore DEBUG] selectedWalletType:",
        selectedWalletType
      );

      console.log("[DepositStore] Request params:", {
        walletType: selectedWalletType.value,
        currency: selectedCurrency,
        network: selectedDepositMethod,
      });

      // ✅ PARSE customAddresses - handle JSON string case
      const profile = useDashboardStore.getState().profile;
      let customAddresses = profile?.customAddressWalletsPairFields || [];

      console.log("[DepositStore DEBUG] Raw customAddresses:", customAddresses);
      console.log(
        "[DepositStore DEBUG] Raw customAddresses type:",
        typeof customAddresses
      );
      console.log(
        "[DepositStore DEBUG] Raw customAddresses length:",
        customAddresses?.length
      );

      // ✅ CRITICAL FIX: Parse JSON string if needed
      if (typeof customAddresses === "string") {
        console.log(
          "[DepositStore] ⚠️ customAddresses is a JSON string, parsing..."
        );
        try {
          customAddresses = JSON.parse(customAddresses);
          console.log(
            "[DepositStore] ✅ Successfully parsed customAddresses from JSON string"
          );
          console.log(
            "[DepositStore DEBUG] Parsed customAddresses:",
            customAddresses
          );
        } catch (e) {
          console.error(
            "[DepositStore] ❌ Failed to parse customAddresses JSON:",
            e
          );
          console.error("[DepositStore] Raw string was:", customAddresses);
          customAddresses = [];
        }
      }

      // ✅ VALIDATE: Ensure it's an array
      if (!Array.isArray(customAddresses)) {
        console.error(
          "[DepositStore] ❌ customAddresses is not an array:",
          typeof customAddresses
        );
        console.error("[DepositStore] Value was:", customAddresses);
        customAddresses = [];
      }

      console.log(
        "[DepositStore DEBUG] Final customAddresses array:",
        customAddresses
      );
      console.log(
        "[DepositStore DEBUG] Final customAddresses length:",
        customAddresses.length
      );
      console.log(
        "[DepositStore DEBUG] Final customAddresses isArray:",
        Array.isArray(customAddresses)
      );

      if (Array.isArray(customAddresses) && customAddresses.length > 0) {
        console.log(
          "[DepositStore] ✅ Custom addresses found:",
          customAddresses.length
        );
        console.log(
          "[DepositStore] Custom addresses data:",
          JSON.stringify(customAddresses, null, 2)
        );

        // Priority 1: Exact match (currency + network)
        if (selectedDepositMethod) {
          console.log(
            "[DepositStore DEBUG] selectedDepositMethod exists, trying exact match..."
          );
          console.log(
            "[DepositStore DEBUG] Looking for: currency =",
            selectedCurrency,
            "network =",
            selectedDepositMethod
          );

          // Log each address comparison
          customAddresses.forEach((addr, index) => {
            console.log(`[DepositStore DEBUG] Address ${index}:`, {
              address_currency: addr.currency,
              address_currency_type: typeof addr.currency,
              address_network: addr.network,
              address_network_type: typeof addr.network,
              selected_currency: selectedCurrency,
              selected_currency_type: typeof selectedCurrency,
              selected_network: selectedDepositMethod,
              selected_network_type: typeof selectedDepositMethod,
              currency_match: addr.currency === selectedCurrency,
              network_match: addr.network === selectedDepositMethod,
              currency_strict_equal: addr.currency === selectedCurrency,
              network_strict_equal: addr.network === selectedDepositMethod,
            });
          });

          const exactMatch = customAddresses.find(
            (addr) =>
              addr.currency === selectedCurrency &&
              addr.network === selectedDepositMethod
          );

          console.log("[DepositStore DEBUG] exactMatch result:", exactMatch);

          if (exactMatch) {
            console.log(
              "[DepositStore] ✅ Found exact match (currency + network):",
              {
                address: exactMatch.address,
                currency: exactMatch.currency,
                network: exactMatch.network,
              }
            );
            set((state) => {
              state.depositAddress = exactMatch;
            });
            console.log(
              "=== [DepositStore] fetchDepositAddress END (exact match) ==="
            );
            return;
          }
          console.log("[DepositStore] ❌ No exact match found");
        } else {
          console.log(
            "[DepositStore DEBUG] ⚠️ selectedDepositMethod is empty/null/undefined!"
          );
          console.log(
            "[DepositStore DEBUG] selectedDepositMethod value:",
            selectedDepositMethod
          );
        }

        // Priority 2: Currency-only match
        console.log("[DepositStore DEBUG] Trying currency-only match...");
        const currencyMatch = customAddresses.find(
          (addr) => addr.currency === selectedCurrency
        );

        console.log(
          "[DepositStore DEBUG] currencyMatch result:",
          currencyMatch
        );

        if (currencyMatch) {
          console.log("[DepositStore] ✅ Found currency match:", {
            address: currencyMatch.address,
            currency: currencyMatch.currency,
            network: currencyMatch.network,
          });
          set((state) => {
            state.depositAddress = currencyMatch;
          });
          console.log(
            "=== [DepositStore] fetchDepositAddress END (currency match) ==="
          );
          return;
        }
        console.log("[DepositStore] ❌ No currency match found");
      } else {
        console.log("[DepositStore] ❌ No custom addresses configured");
        console.log("[DepositStore DEBUG] Reason:", {
          isArray: Array.isArray(customAddresses),
          length: customAddresses?.length,
          value: customAddresses,
        });
      }

      // ❌ NO API CALL - if no custom address, set to null
      console.log(
        "[DepositStore] ⚠️ No custom address configured for this currency/network"
      );
      console.log("[DepositStore] Setting depositAddress to null");
      set((state) => {
        state.depositAddress = null;
      });

      console.log(
        "=== [DepositStore] fetchDepositAddress END (no address) ==="
      );
    },

    sendTransactionHash: async () => {
      const { transactionHash, selectedCurrency, selectedDepositMethod } =
        get();
      try {
        console.log("transactionHash", transactionHash);
        console.log("selectedCurrency", selectedCurrency);
        console.log("selectedDepositMethod", selectedDepositMethod);
        const { data, error } = await $fetch({
          url: `${endpoint}/deposit/spot`,
          method: "POST",
          silent: true,
          body: {
            currency: selectedCurrency,
            chain: selectedDepositMethod,
            trx: transactionHash,
          },
        });

        if (error) {
          toast.error(error || "An unexpected error occurred");
          set((state) => {
            state.loading = false;
          });
        } else {
          set((state) => {
            state.deposit = data;
            state.transactionSent = true;
            state.step = 4;
            state.loading = true; // Set loading true when sending the transaction
          });
        }
      } catch (error) {
        console.error("Error in sending transaction hash:", error);
        toast.error("An error occurred while sending transaction hash");
        set((state) => {
          state.loading = false;
        });
      }
    },

    clearAll: () =>
      set(() => ({
        step: 1,
        selectedWalletType: { value: "", label: "Select a wallet type" },
        currencies: [],
        selectedCurrency: "Select a currency",
        depositMethods: [],
        selectedDepositMethod: null,
        depositAddress: "",
        depositAmount: 0,
        loading: false,
        deposit: null,
        stripeListener: false,
        transactionHash: "",
      })),
  }))
);

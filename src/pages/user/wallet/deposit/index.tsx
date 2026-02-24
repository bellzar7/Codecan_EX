import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StepProgress } from "@/components/elements/addons/StepProgress";
import { Faq } from "@/components/pages/knowledgeBase/Faq";
import { DepositAddress } from "@/components/pages/user/wallet/deposit/DepositAddress";
import { DepositConfirmed } from "@/components/pages/user/wallet/deposit/DepositConfirmed";
import { FiatDepositAmount } from "@/components/pages/user/wallet/deposit/FiatDepositAmount";
import { SelectCurrency } from "@/components/pages/user/wallet/deposit/SelectCurrency";
import { SelectFiatDepositMethod } from "@/components/pages/user/wallet/deposit/SelectFiatDepositMethod";
import { SelectNetwork } from "@/components/pages/user/wallet/deposit/SelectNetwork";
import { SelectWalletType } from "@/components/pages/user/wallet/deposit/SelectWalletType";
import MinimalHeader from "@/components/widgets/MinimalHeader";
import MinimalLayout from "@/layouts/Minimal";
import { useDashboardStore } from "@/stores/dashboard";
import { useDepositStore } from "@/stores/user/wallet/deposit";
import $fetch from "@/utils/api";
import WebSocketManager from "@/utils/ws";

interface DepositStatusResponse {
  status: string;
  transaction?: {
    id?: string;
    amount?: number;
    currency?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export default function AuthWizard() {
  const { t } = useTranslation();
  const {
    step,
    selectedWalletType,
    depositAddress,
    clearAll,
    transactionSent,
    transactionHash,
    selectedCurrency,
    selectedDepositMethod,
    setDeposit,
    setStep,
    setLoading,
    loading,
    initializeWalletTypes,
  } = useDepositStore();

  const { profile, getSetting } = useDashboardStore();
  const router = useRouter();
  const [wsManager, setWsManager] = useState<WebSocketManager | null>(null);

  const depositEnabled = getSetting("deposit") !== "false";

  useEffect(() => {
    if (
      router.isReady &&
      getSetting("depositRestrictions") === "true" &&
      (!profile?.kyc?.status ||
        (Number.parseFloat(profile?.kyc?.level || "0") < 2 &&
          profile?.kyc?.status !== "APPROVED")) &&
      depositEnabled
    ) {
      router.push("/user/profile?tab=kyc");
      toast.error(t("Please complete your KYC to deposit funds"));
    }
  }, [
    router.isReady,
    profile?.kyc?.status,
    depositEnabled,
    getSetting,
    profile?.kyc?.level,
    router.push,
    t,
  ]);
  //
  // useEffect(() => {
  //   setSelectedWalletType({ value: "SPOT", label: "Spot" });
  //   fetchCurrencies();
  // }, []);

  useEffect(() => {
    if (router.isReady) {
      initializeWalletTypes();
    }
  }, [router.isReady, initializeWalletTypes]);

  useEffect(() => {
    if (
      selectedWalletType.value !== "FIAT" &&
      step === 4 &&
      selectedWalletType.value === "SPOT" &&
      profile?.id &&
      depositAddress.address
    ) {
      console.log(
        "[Deposit] Setting up WebSocket for SPOT deposit monitoring",
        {
          currency: selectedCurrency,
          network: selectedDepositMethod,
          address: depositAddress.address,
        }
      );
      const wsPath = `/api/finance/deposit/spot?userId=${profile?.id}`;

      const manager = new WebSocketManager(wsPath);
      manager.connect();

      setWsManager(manager);

      // Handle incoming messages
      // biome-ignore lint/suspicious/noExplicitAny: WebSocket message structure is dynamic
      manager.on("message", (message: any) => {
        console.log("[Deposit] WebSocket message received:", message);

        if (!message?.data || message.stream !== "verification") {
          console.log("[Deposit] Ignoring message - wrong format or stream:", {
            hasData: !!message?.data,
            stream: message?.stream,
          });
          return;
        }

        console.log("[Deposit] Processing verification message:", {
          status: message.data.status,
          message: message.data.message,
        });

        switch (message.data.status) {
          case 200:
          case 201:
            console.log("[Deposit] ✅ Deposit verified successfully!");
            toast.success(message.data.message);
            setDeposit(message.data);
            setLoading(false);
            setStep(5);
            break;
          case 400:
          case 401:
          case 403:
          case 404:
          case 500:
            console.log(
              "[Deposit] ❌ Deposit verification failed:",
              message.data.status
            );
            setLoading(false);
            toast.error(message.data.message);
            break;
          default:
            console.log("[Deposit] Unknown status code:", message.data.status);
            break;
        }
      });
      return () => {
        manager.disconnect();
      };
    }
  }, [
    selectedWalletType.value,
    step,
    profile?.id,
    depositAddress.address,
    selectedCurrency,
    selectedDepositMethod,
    setDeposit,
    setLoading,
    setStep,
  ]);

  // Handling WebSocket disconnection and sending messages
  useEffect(() => {
    if (wsManager && step === 4 && selectedWalletType.value === "SPOT") {
      // Subscribe if user sent transaction OR if waiting for admin approval
      if (transactionSent && transactionHash) {
        console.log("[Deposit] Subscribing to transaction verification", {
          transactionHash,
        });
        // Send a subscription message
        wsManager.send({
          action: "SUBSCRIBE",
          payload: {
            trx: transactionHash,
          },
        });
      } else {
        // Also listen for admin approvals (user didn't send transaction yet)
        console.log(
          "[Deposit] Subscribing to pending deposits (waiting for admin approval)",
          {
            userId: profile?.id,
            currency: selectedCurrency,
            network: selectedDepositMethod,
          }
        );
        wsManager.send({
          action: "SUBSCRIBE",
          payload: {
            userId: profile?.id,
            currency: selectedCurrency,
            network: selectedDepositMethod,
          },
        });
      }

      return () => {
        // Unsubscribe when leaving the step or after confirmation
        if (transactionHash) {
          wsManager.send({
            action: "UNSUBSCRIBE",
            payload: {
              trx: transactionHash,
            },
          });
        } else {
          wsManager.send({
            action: "UNSUBSCRIBE",
            payload: {
              userId: profile?.id,
              currency: selectedCurrency,
              network: selectedDepositMethod,
            },
          });
        }
      };
    }
  }, [
    wsManager,
    step,
    transactionSent,
    transactionHash,
    profile?.id,
    selectedCurrency,
    selectedDepositMethod,
    selectedWalletType.value,
  ]);

  // Polling fallback: Check deposit status every 10 seconds if on step 4 with loading
  useEffect(() => {
    if (
      step === 4 &&
      loading &&
      selectedWalletType.value === "SPOT" &&
      depositAddress?.address
    ) {
      console.log("[Deposit] Starting polling fallback for deposit status");

      const checkDepositStatus = async () => {
        try {
          console.log("[Deposit] Polling: Checking deposit status...");
          const { data, error } = await $fetch({
            url: "/api/finance/deposit/status",
            method: "GET",
            silent: true,
            params: {
              userId: profile?.id || "",
              currency: selectedCurrency,
              address: depositAddress.address,
            },
          });

          if (!error && data) {
            console.log("[Deposit] Polling: Status response:", data);

            // Check if deposit was completed
            if ((data as DepositStatusResponse).status === "COMPLETED") {
              console.log("[Deposit] ✅ Polling detected completed deposit!");
              toast.success("Deposit confirmed successfully");
              setDeposit(data);
              setLoading(false);
              setStep(5);
            } else {
              console.log("[Deposit] Polling: Deposit still pending");
            }
          }
        } catch (err) {
          console.error("[Deposit] Polling error:", err);
        }
      };

      // Check immediately
      checkDepositStatus();

      // Then check every 10 seconds
      const interval = setInterval(checkDepositStatus, 10_000);

      return () => {
        console.log("[Deposit] Stopping polling fallback");
        clearInterval(interval);
      };
    }
  }, [
    step,
    loading,
    selectedWalletType.value,
    depositAddress?.address,
    profile?.id,
    selectedCurrency,
    setDeposit,
    setLoading,
    setStep,
  ]);

  // Clear all state when leaving the wizard or completing the process
  useEffect(() => {
    // Change this condition as needed to control when to clear
    return () => {
      if (step === 5) {
        clearAll();
      }
    };
  }, [step, clearAll]);

  return (
    <MinimalLayout color="muted" title={t("Wizard")}>
      <main className="relative min-h-screen">
        <MinimalHeader />
        <StepProgress
          icons={[
            "ph:currency-dollar-simple-duotone",
            "ph:flag-duotone",
            "solar:password-minimalistic-input-line-duotone",
            "ph:flag-duotone",
          ]}
          step={step}
        />
        {depositEnabled ? (
          <form
            action="#"
            className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-stretch pt-36 pb-20"
            method="POST"
          >
            {step === 1 && <SelectWalletType />}

            {step === 2 && <SelectCurrency />}

            {step === 3 && selectedWalletType.value === "FIAT" && (
              <SelectFiatDepositMethod />
            )}

            {step === 4 && selectedWalletType.value === "FIAT" && (
              <FiatDepositAmount />
            )}

            {/* Network selection for SPOT wallet */}
            {step === 3 && selectedWalletType.value === "SPOT" && (
              <SelectNetwork />
            )}

            {/* Deposit address for SPOT wallet after network selection */}
            {step === 4 && selectedWalletType.value === "SPOT" && (
              <DepositAddress />
            )}

            {((step === 5 && selectedWalletType.value === "SPOT") ||
              (step === 5 && selectedWalletType.value === "FIAT")) && (
              <DepositConfirmed />
            )}

            <hr className="my-6 border-muted-200 border-t dark:border-muted-800" />
            <div className="text-center">
              <p className="mt-4 space-x-2 font-sans text-muted-600 text-sm leading-5 dark:text-muted-400">
                <span>{t("Having any trouble")}</span>
                <Link
                  className="font-medium text-primary-600 underline-offset-4 transition duration-150 ease-in-out hover:text-primary-500 hover:underline focus:underline focus:outline-hidden"
                  href="/user/support/ticket"
                >
                  {t("Contact us")}
                </Link>
              </p>
            </div>

            {selectedWalletType.value === "FIAT" && (
              <Faq category="DEPOSIT_FIAT" />
            )}

            {selectedWalletType.value === "SPOT" && (
              <Faq category="DEPOSIT_SPOT" />
            )}

            <div className="absolute right-0 bottom-0 left-0 flex flex-col items-center justify-between rounded-t-md bg-white p-4 shadow-md md:flex-row dark:bg-muted-800">
              <p className="text-center text-gray-500 text-sm dark:text-muted-300">
                {t("Please note that depositing funds may take some time.")}
              </p>
              <button
                className="cursor-pointer text-center text-muted-500 text-sm underline dark:text-muted-200"
                onClick={() => {
                  clearAll();
                  router.back();
                }}
                type="button"
              >
                {t("Cancel")}
              </button>
            </div>
          </form>
        ) : (
          <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center pt-36 pb-10">
            <p className="font-semibold text-lg text-red-600">
              {t(
                "Deposits are currently disabled. Please contact support for more information."
              )}
            </p>

            <hr className="my-6 border-muted-200 border-t dark:border-muted-800" />

            <div className="text-center">
              <p className="mt-4 space-x-2 font-sans text-muted-600 text-sm leading-5 dark:text-muted-400">
                <span>{t("Having any trouble")}</span>
                <Link
                  className="font-medium text-primary-600 underline-offset-4 transition duration-150 ease-in-out hover:text-primary-500 hover:underline focus:underline focus:outline-hidden"
                  href="/user/support/ticket"
                >
                  {t("Contact us")}
                </Link>
              </p>

              <button
                className="cursor-pointer text-center text-muted-500 text-sm underline dark:text-muted-200"
                onClick={() => router.back()}
                type="button"
              >
                {t("Go back")}
              </button>
            </div>
          </div>
        )}
      </main>
    </MinimalLayout>
  );
}

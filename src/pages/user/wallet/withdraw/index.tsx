import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect } from "react";
import { toast } from "sonner";
import { StepProgress } from "@/components/elements/addons/StepProgress";
import { Faq } from "@/components/pages/knowledgeBase/Faq";
import { FiatWithdrawAmount } from "@/components/pages/user/wallet/withdraw/FiatWithdrawAmount";
import { SelectCurrency } from "@/components/pages/user/wallet/withdraw/SelectCurrency";
import { SelectFiatWithdrawMethod } from "@/components/pages/user/wallet/withdraw/SelectFiatWithdrawMethod";
import { SelectWalletType } from "@/components/pages/user/wallet/withdraw/SelectWalletType";
import { WithdrawAmount } from "@/components/pages/user/wallet/withdraw/WithdrawAmount";
import { WithdrawConfirmed } from "@/components/pages/user/wallet/withdraw/WithdrawConfirmed";
import MinimalHeader from "@/components/widgets/MinimalHeader";
import MinimalLayout from "@/layouts/Minimal";
import { useDashboardStore } from "@/stores/dashboard";
import { useWithdrawStore } from "@/stores/user/wallet/withdraw";

export default function AuthWizard() {
  const { t } = useTranslation();
  const {
    step,
    selectedWalletType,
    clearAll,
    initializeWalletTypes,
    fetchCurrencies,
    walletTypes,
  } = useWithdrawStore();

  const { profile, getSetting } = useDashboardStore();
  const router = useRouter();

  const withdrawEnabled = getSetting("withdraw") !== "false";

  useEffect(() => {
    if (
      router.isReady &&
      getSetting("withdrawalRestrictions") === "true" &&
      (!profile?.kyc?.status ||
        (Number.parseFloat(profile?.kyc?.level || "0") < 2 &&
          profile?.kyc?.status !== "APPROVED")) &&
      withdrawEnabled
    ) {
      router.push("/user/profile?tab=kyc");
      toast.error(t("Please complete your KYC to withdraw funds"));
    }
  }, [router.isReady, profile?.kyc?.status, withdrawEnabled]);

  useEffect(() => {
    if (router.isReady) initializeWalletTypes();
  }, [router.isReady]);

  useEffect(() => {
    fetchCurrencies();
    console.log("initializeWalletTypes", walletTypes);
  }, []);

  useEffect(() => {
    // Change this condition as needed to control when to clear
    return () => {
      if (step === 5) {
        clearAll();
      }
    };
  }, [step]);

  return (
    <MinimalLayout color="muted" title={t("Wizard")}>
      <main className="relative min-h-screen">
        <MinimalHeader />
        <StepProgress
          icons={[
            "ph:currency-dollar-simple-duotone",
            "ph:sketch-logo-duotone",
            "solar:password-minimalistic-input-line-duotone",
            "ph:flag-duotone",
          ]}
          step={step}
        />
        {withdrawEnabled ? (
          <form
            action="#"
            className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-stretch pt-36 pb-20"
            method="POST"
          >
            {step === 1 && <SelectWalletType />}

            {step === 2 && <SelectCurrency />}

            {step === 3 && selectedWalletType.value === "FIAT" && (
              <SelectFiatWithdrawMethod />
            )}

            {step === 4 && selectedWalletType.value === "FIAT" && (
              <FiatWithdrawAmount />
            )}

            {/*{step === 2 &&*/}
            {/*  ["ECO", "SPOT"].includes(selectedWalletType.value) && (*/}
            {/*    <SelectNetwork />*/}
            {/*  )}*/}

            {step === 3 && selectedWalletType.value !== "FIAT" && (
              <WithdrawAmount />
            )}

            {step === 4 ||
              (step === 5 && selectedWalletType.value === "FIAT" && (
                <WithdrawConfirmed />
              ))}

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
              <Faq category="WITHDRAW_FIAT" />
            )}

            {selectedWalletType.value === "SPOT" && (
              <Faq category="WITHDRAW_SPOT" />
            )}

            {selectedWalletType.value === "ECO" && (
              <Faq category="WITHDRAW_FUNDING" />
            )}

            <div className="absolute right-0 bottom-0 left-0 flex flex-col items-center justify-between rounded-t-md bg-white p-4 shadow-md md:flex-row dark:bg-muted-800">
              <p className="text-center text-gray-500 text-sm dark:text-muted-300">
                {t("Please note that withdrawing funds may take some time.")}
              </p>
              <span
                className="cursor-pointer text-center text-muted-500 text-sm underline dark:text-muted-200"
                onClick={() => {
                  clearAll();
                  router.back();
                }}
              >
                {t("Cancel")}
              </span>
            </div>
          </form>
        ) : (
          <>
            <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center pt-36 pb-10">
              <p className="font-semibold text-lg text-red-600">
                {t(
                  "Withdrawals are currently disabled. Please contact support for more information."
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

                <span
                  className="cursor-pointer text-center text-muted-500 text-sm underline dark:text-muted-200"
                  onClick={() => router.back()}
                >
                  {t("Go back")}
                </span>
              </div>
            </div>
          </>
        )}
      </main>
    </MinimalLayout>
  );
}

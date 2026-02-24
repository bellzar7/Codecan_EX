import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect } from "react";
import { StepProgress } from "@/components/elements/addons/StepProgress";
import { SelectCurrency } from "@/components/pages/user/forex/withdraw/SelectCurrency";
import { SelectNetwork } from "@/components/pages/user/forex/withdraw/SelectNetwork";
import { SelectWalletType } from "@/components/pages/user/forex/withdraw/SelectWalletType";
import { WithdrawAmount } from "@/components/pages/user/forex/withdraw/WithdrawAmount";
import { WithdrawConfirmed } from "@/components/pages/user/forex/withdraw/WithdrawConfirmed";
import MinimalHeader from "@/components/widgets/MinimalHeader";
import MinimalLayout from "@/layouts/Minimal";
import { useWithdrawStore } from "@/stores/user/forex/withdraw";
export default function AuthWizard() {
  const { t } = useTranslation();
  const { step, selectedWalletType, clearAll, fetchAccount } =
    useWithdrawStore();
  const router = useRouter();
  const { id } = router.query as {
    id: string;
  };
  // Clear all state when leaving the wizard or completing the process
  useEffect(() => {
    if (router.isReady) {
      fetchAccount(id);
    }
    return () => {
      if (step === 5) {
        clearAll();
      }
    };
  }, [router.isReady, step]);
  return (
    <MinimalLayout color="muted" title={t("Wizard")}>
      <main className="relative min-h-screen">
        <MinimalHeader />
        <StepProgress
          icons={[
            "solar:wallet-bold-duotone",
            "ph:currency-dollar-simple-duotone",
            "ph:sketch-logo-duotone",
            "solar:password-minimalistic-input-line-duotone",
            "ph:flag-duotone",
          ]}
          step={step}
        />
        <form
          action="#"
          className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-stretch pt-36"
          method="POST"
        >
          {step === 1 && <SelectWalletType />}

          {step === 2 && <SelectCurrency />}

          {step === 3 && ["ECO", "SPOT"].includes(selectedWalletType.value) && (
            <SelectNetwork />
          )}

          {step === 4 && <WithdrawAmount />}

          {step === 5 && <WithdrawConfirmed />}
          <div className="absolute right-0 bottom-0 left-0 flex flex-col items-center justify-between rounded-t-md bg-white p-4 shadow-md md:flex-row dark:bg-muted-800">
            <p className="text-center text-gray-500 text-sm dark:text-muted-300">
              {t("Please note that withdrawing funds may take some time.")}
            </p>
            <span
              className="cursor-pointer text-center text-muted-500 text-sm underline dark:text-muted-200"
              onClick={() => router.back()}
            >
              {t("Cancel")}
            </span>
          </div>
        </form>
      </main>
    </MinimalLayout>
  );
}

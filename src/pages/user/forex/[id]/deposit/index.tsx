import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect } from "react";
import { StepProgress } from "@/components/elements/addons/StepProgress";
import { DepositAmount } from "@/components/pages/user/forex/deposit/DepositAmount";
import { DepositConfirmed } from "@/components/pages/user/forex/deposit/DepositConfirmed";
import { SelectCurrency } from "@/components/pages/user/forex/deposit/SelectCurrency";
import { SelectNetwork } from "@/components/pages/user/forex/deposit/SelectNetwork";
import { SelectWalletType } from "@/components/pages/user/forex/deposit/SelectWalletType";
import MinimalHeader from "@/components/widgets/MinimalHeader";
import MinimalLayout from "@/layouts/Minimal";
import { useDepositStore } from "@/stores/user/forex/deposit";
export default function AuthWizard() {
  const { t } = useTranslation();
  const { step, selectedWalletType, clearAll } = useDepositStore();
  // Clear all state when leaving the wizard or completing the process
  useEffect(() => {
    // Change this condition as needed to control when to clear
    return () => {
      if (step === 5) {
        clearAll();
      }
    };
  }, [step]);
  const router = useRouter();
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

          {step === 4 && <DepositAmount />}

          {step === 5 && <DepositConfirmed />}
          <div className="absolute right-0 bottom-0 left-0 flex flex-col items-center justify-between rounded-t-md bg-white p-4 shadow-md md:flex-row dark:bg-muted-800">
            <p className="text-center text-gray-500 text-sm dark:text-muted-300">
              {t("Please note that depositing funds may take some time.")}
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

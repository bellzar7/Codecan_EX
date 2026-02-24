import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect } from "react";
import { toast } from "sonner";
import { StepProgress } from "@/components/elements/addons/StepProgress";
import { SelectCurrency } from "@/components/pages/user/wallet/transfer/SelectCurrency";
import { SelectTargetWalletType } from "@/components/pages/user/wallet/transfer/SelectTargetWalletType";
import { SelectTransferType } from "@/components/pages/user/wallet/transfer/SelectTransferType"; // New component
import { SelectWalletType } from "@/components/pages/user/wallet/transfer/SelectWalletType";
import { TransferAmount } from "@/components/pages/user/wallet/transfer/TransferAmount";
import { TransferConfirmed } from "@/components/pages/user/wallet/transfer/TransferConfirmed";
import MinimalHeader from "@/components/widgets/MinimalHeader";
import MinimalLayout from "@/layouts/Minimal";
import { useDashboardStore } from "@/stores/dashboard";
import { useTransferStore } from "@/stores/user/wallet/transfer";

export default function AuthWizard() {
  const { t } = useTranslation();
  const { step, clearAll, transferType, initializeWalletTypes } =
    useTransferStore();
  const { profile, getSetting } = useDashboardStore();
  const router = useRouter();

  const transferEnabled = getSetting("transfer") !== "false";

  useEffect(() => {
    if (
      router.isReady &&
      getSetting("transferRestrictions") === "true" &&
      (!profile?.kyc?.status ||
        (Number.parseFloat(profile?.kyc?.level || "0") < 2 &&
          profile?.kyc?.status !== "APPROVED")) &&
      transferEnabled
    ) {
      router.push("/user/profile?tab=kyc");
      toast.error(t("Please complete your KYC to transfer funds"));
    }
  }, [router.isReady, profile?.kyc?.status, transferEnabled]);

  useEffect(() => {
    if (router.isReady) initializeWalletTypes();
  }, [router.isReady]);

  // Clear all state when leaving the wizard or completing the process
  useEffect(() => {
    return () => {
      if (step === 6) {
        clearAll();
      }
    };
  }, [step]);

  const renderStep = () => {
    switch (step) {
      case 1:
        return <SelectTransferType />;
      case 2:
        return <SelectWalletType />;
      case 3:
        return transferType.value === "client" ? (
          <SelectCurrency />
        ) : (
          <SelectTargetWalletType />
        );
      case 4:
        return <SelectCurrency />;
      case 5:
        return <TransferAmount />;
      case 6:
        return <TransferConfirmed />;
      default:
        return null;
    }
  };

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
            "ph:check-circle-duotone",
          ]}
          step={step}
        />
        {transferEnabled ? (
          <form
            action="#"
            className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-stretch pt-36"
            method="POST"
          >
            {renderStep()}
            <div className="absolute right-0 bottom-0 left-0 flex flex-col items-center justify-between rounded-t-md bg-white p-4 shadow-md md:flex-row dark:bg-muted-800">
              <p className="text-center text-gray-500 text-sm dark:text-muted-300">
                {t("Please note that transferring funds may take some time.")}
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
            <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center pt-36 pb-20">
              <p className="font-semibold text-lg text-red-600">
                {t(
                  "Transfers are currently disabled. Please contact support for more information."
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

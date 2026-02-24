// components/payment/SelectWalletType.tsx

import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import Button from "@/components/elements/base/button/Button";
import RadioHeadless from "@/components/elements/form/radio/RadioHeadless";

export const SelectWalletType = ({
  walletTypes,
  selectedWalletType,
  setSelectedWalletType,
  onNext,
}) => {
  const { t } = useTranslation();

  return (
    <div>
      <div className="mb-12 space-y-1 text-center font-sans">
        <h2 className="font-light text-2xl text-muted-800 dark:text-muted-100">
          {t("Select a Wallet Type")}
        </h2>
        <p className="text-muted-400 text-sm">
          {t("Pick one of the following wallet types to continue")}
        </p>
      </div>

      <div className="mx-auto mb-4 w-full max-w-lg rounded-sm px-8 pb-8">
        <div className={"grid gap-4"}>
          {walletTypes.map((walletType) => (
            <RadioHeadless
              checked={selectedWalletType.value === walletType.value}
              key={walletType.value}
              name="walletType"
              onChange={() => setSelectedWalletType(walletType)}
            >
              <div
                className={`flex items-center justify-between rounded-md border bg-white p-4 dark:bg-muted-800 ${
                  selectedWalletType.value === walletType.value
                    ? "border-success-500"
                    : "border-muted-200 dark:border-muted-800"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <h5 className="font-medium text-lg text-muted-800 dark:text-muted-100">
                    {t(walletType.label)}
                  </h5>
                </div>
                <div className="flex items-center">
                  {selectedWalletType.value === walletType.value && (
                    <Icon
                      className="h-6 w-6 text-success-500"
                      icon="ph:check-circle-duotone"
                    />
                  )}
                </div>
              </div>
            </RadioHeadless>
          ))}
        </div>

        <div className="mt-6">
          <Button
            className="w-full"
            color="primary"
            disabled={selectedWalletType.value === ""}
            onClick={onNext}
            size="lg"
            type="button"
          >
            {t("Continue")}
            <Icon className="h-5 w-5" icon="mdi:chevron-right" />
          </Button>
        </div>
      </div>
    </div>
  );
};

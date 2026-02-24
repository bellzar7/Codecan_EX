import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import { memo } from "react";
import Button from "@/components/elements/base/button/Button";
import RadioHeadless from "@/components/elements/form/radio/RadioHeadless";
import { useTransferStore } from "@/stores/user/wallet/transfer";
import { getValidDestinations } from "@/utils/transfer-matrix";

const SelectTargetWalletTypeBase = () => {
  const { t } = useTranslation();
  const {
    walletTypes,
    selectedWalletType,
    selectedTargetWalletType,
    setSelectedTargetWalletType,
    setStep,
    fetchCurrencies,
  } = useTransferStore();
  /**
   * Filter wallet types based on the centralized transfer matrix.
   * This ensures the UI matches backend transfer rules exactly.
   *
   * Transfer Matrix:
   * - FIAT → SPOT, ECO, FOREX, STOCK, INDEX
   * - SPOT → FIAT, ECO, FUTURES, FOREX, STOCK, INDEX
   * - ECO → FIAT, SPOT, FUTURES
   * - FUTURES → SPOT, ECO
   * - FOREX → FIAT, SPOT
   * - STOCK → FIAT, SPOT
   * - INDEX → FIAT, SPOT
   */
  const getFilteredWalletTypes = () => {
    const { value: fromWalletType } = selectedWalletType;

    // Get valid destinations from centralized transfer matrix
    const validDestinations = getValidDestinations(fromWalletType);

    // Filter wallet types to only show valid destinations
    return walletTypes.filter((type) =>
      validDestinations.includes(type.value as any)
    );
  };
  // Determine the number of columns based on the number of filtered wallet types
  const getGridCols = () => {
    const filteredTypes = getFilteredWalletTypes();
    switch (filteredTypes.length) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-1 sm:grid-cols-2";
      case 3:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      default:
        return "grid-cols-1";
    }
  };

  return (
    <div>
      <div className="mb-12 space-y-1 text-center font-sans">
        <h2 className="font-light text-2xl text-muted-800 dark:text-muted-100">
          {t("Select a Target Wallet Type")}
        </h2>
        <p className="text-muted-400 text-sm">
          {t("Choose the wallet type you want to transfer to")}
        </p>
      </div>

      <div className="mx-auto mb-4 w-full max-w-lg rounded-sm px-8 pb-8">
        <div className={`grid gap-4 ${getGridCols()}`}>
          {getFilteredWalletTypes().map((walletType) => (
            <RadioHeadless
              checked={selectedTargetWalletType.value === walletType.value}
              key={walletType.value}
              name="targetWalletType"
              onChange={() => setSelectedTargetWalletType(walletType)}
            >
              <div
                className={`flex items-center justify-between rounded-md border bg-white p-4 dark:bg-muted-800 ${
                  selectedTargetWalletType.value === walletType.value
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
                  {selectedTargetWalletType.value === walletType.value && (
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

        <div className="mx-auto mt-8! max-w-sm">
          <div className="flex w-full justify-center gap-4">
            <Button
              onClick={() => {
                setStep(2);
              }}
              size="lg"
              type="button"
            >
              <Icon className="h-5 w-5" icon="mdi:chevron-left" />
              {t("Go Back")}
            </Button>
            <Button
              className="w-full"
              color="primary"
              disabled={selectedTargetWalletType.value === ""}
              onClick={() => {
                fetchCurrencies();
                setStep(4);
              }}
              size="lg"
              type="button"
            >
              {t("Continue")}
              <Icon className="h-5 w-5" icon="mdi:chevron-right" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SelectTargetWalletType = memo(SelectTargetWalletTypeBase);

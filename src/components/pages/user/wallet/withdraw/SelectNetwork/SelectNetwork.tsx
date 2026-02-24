import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import { memo, useEffect, useState } from "react";
import Button from "@/components/elements/base/button/Button";
import { useDashboardStore } from "@/stores/dashboard";
import { useWalletStore } from "@/stores/user/wallet"; // Adjust the import path as needed
import { useWithdrawStore } from "@/stores/user/wallet/withdraw";
import { formatNumber } from "@/utils/strings";

const SelectNetworkBase = () => {
  const { t } = useTranslation();
  const {
    selectedCurrency,
    setSelectedCurrency,
    selectedWithdrawMethod,
    setSelectedWithdrawMethod,
    setStep,
    withdrawMethods,
    selectedWalletType,
  } = useWithdrawStore();

  const { wallet, fetchWallet } = useWalletStore();

  const [balances, setBalances] = useState({}); // To store balances per chain
  const { settings } = useDashboardStore();

  useEffect(() => {
    if (selectedWalletType.value === "ECO") {
      // Fetch the wallet for the selected currency and type
      fetchWallet(selectedWalletType.value, selectedCurrency);
    }
  }, [selectedWalletType.value, selectedCurrency]);

  useEffect(() => {
    if (selectedWalletType.value === "ECO" && wallet) {
      // Process the addresses to get balances per chain
      const addresses =
        typeof wallet.address === "string"
          ? JSON.parse(wallet.address)
          : wallet.address;
      // addresses is an object with keys as chains and values as objects with address and balance
      const chainBalances = {};
      for (const [chain, data] of Object.entries(addresses)) {
        chainBalances[chain] = (data as any).balance;
      }
      setBalances(chainBalances);
    }
  }, [selectedWalletType.value, wallet]);

  if (!withdrawMethods || withdrawMethods.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Icon
            className="h-12 w-12 animate-spin text-primary-500"
            icon="mdi:loading"
          />
          <p className="text-primary-500 text-xl">
            {t("Loading")} {selectedCurrency} {t("networks...")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-12 space-y-1 text-center font-sans">
        <h2 className="font-light text-2xl text-muted-800 dark:text-muted-100">
          {t("Select a Network")}
        </h2>
        <p className="text-muted-400 text-sm">
          {t("Pick one of the following currency networks to continue")}
        </p>
      </div>

      <div className="mx-auto mb-4 w-full max-w-4xl space-y-10 rounded-sm px-8 pb-8">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-4">
            <h3 className="mb-1 font-medium font-sans text-muted-800 dark:text-muted-100">
              {selectedCurrency} {t("Networks")}
            </h3>
            <p className="font-sans text-muted-500 text-sm md:max-w-[190px] dark:text-muted-400">
              {t("Select a network to continue")}
            </p>
          </div>
          <div className="md:col-span-8">
            <div className="mx-auto mb-4 w-full max-w-xl space-y-5 rounded-sm px-8 pb-8">
              {withdrawMethods.map((item, index) => {
                const chain = item.chain;
                const balance = balances[chain] || 0;
                const isDisabled =
                  selectedWalletType.value === "ECO" && balance <= 0;

                return (
                  <div
                    className={`cursor-pointer rounded border transition-colors duration-300 ${
                      selectedWithdrawMethod?.chain === item.chain
                        ? "border border-primary-600 bg-white dark:border-primary-400 dark:bg-muted-950"
                        : "group relative rounded-sm border border-muted-200 bg-muted-100 transition-colors duration-300 hover:border-primary-600 hover:bg-white dark:border-muted-800 dark:bg-muted-800 dark:hover:border-primary-400 dark:hover:bg-muted-900"
                    } ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
                    key={index}
                    onClick={() => {
                      if (!isDisabled) {
                        setSelectedWithdrawMethod(item);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between gap-5 px-4 py-3 font-sans text-muted-600 text-sm transition-colors duration-300">
                      <div className="flex w-full flex-col">
                        <div className="flex justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-md text-muted-800 dark:text-muted-200">
                              {item.chain}
                            </span>
                          </div>
                          {selectedWalletType.value === "ECO" && (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-md text-muted-800 dark:text-muted-200">
                                {t("Balance")}: {balance}
                              </span>
                            </div>
                          )}
                        </div>
                        {/* Existing fee and limit information */}
                        <div className="mt-2 flex flex-col text-sm">
                          <div className="flex gap-1">
                            <span className="text-muted-500 dark:text-muted-400">
                              {t("Minimum Withdraw")}
                            </span>
                            <span className="text-muted-800 dark:text-muted-200">
                              {formatNumber(
                                item.limits?.withdraw?.min ||
                                  item.limits?.amount?.min ||
                                  0
                              )}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <span className="text-muted-500 dark:text-muted-400">
                              {t("Maximum Withdraw")}
                            </span>
                            <span className="text-muted-800 dark:text-muted-200">
                              {formatNumber(
                                item.limits?.withdraw?.max ||
                                  item.limits?.amount?.max ||
                                  "Unlimited"
                              )}
                            </span>
                          </div>
                          {typeof item.fee?.min === "number" && (
                            <div className="flex gap-1">
                              <span className="text-muted-500 dark:text-muted-400">
                                {t("Minimum Fee")}
                              </span>
                              <span className="text-muted-800 dark:text-muted-200">
                                {formatNumber(item.fee.min)} {selectedCurrency}
                              </span>
                            </div>
                          )}
                          {typeof item.fee?.percentage === "number" && (
                            <div className="flex gap-1">
                              <span className="text-muted-500 dark:text-muted-400">
                                {t("Percentage Fee")}
                              </span>
                              <span className="text-muted-800 dark:text-muted-200">
                                {selectedWalletType.value === "SPOT"
                                  ? `${
                                      item.fee.percentage +
                                      Number.parseFloat(
                                        settings.walletTransferFee || "0"
                                      )
                                    }%`
                                  : `${item.fee.percentage}%`}
                              </span>
                            </div>
                          )}

                          {typeof item.fixedFee === "number" && (
                            <div className="flex gap-1">
                              <span className="text-muted-500 dark:text-muted-400">
                                {t("Fixed Withdraw Fee")}
                              </span>
                              <span className="text-muted-800 dark:text-muted-200">
                                {formatNumber(item.fixedFee)}
                              </span>
                            </div>
                          )}
                          {typeof item.percentageFee === "number" && (
                            <div className="flex gap-1">
                              <span className="text-muted-500 dark:text-muted-400">
                                {t("Percentage Withdraw Fee")}
                              </span>
                              <span className="text-muted-800 dark:text-muted-200">
                                {selectedWalletType.value === "SPOT"
                                  ? `${
                                      item.percentageFee +
                                      Number.parseFloat(
                                        settings.walletTransferFee || "0"
                                      )
                                    }%`
                                  : `${item.percentageFee}%`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16! max-w-sm">
          <div className="flex w-full justify-center gap-4">
            <Button
              className="w-full"
              onClick={() => {
                setSelectedCurrency("Select a currency");
                setStep(1);
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
              disabled={!selectedWithdrawMethod}
              onClick={() => {
                setStep(3);
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

export const SelectNetwork = memo(SelectNetworkBase);

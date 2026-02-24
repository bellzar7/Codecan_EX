import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import { memo } from "react";
import Avatar from "@/components/elements/base/avatar/Avatar";
import Button from "@/components/elements/base/button/Button";
import { useDepositStore } from "@/stores/user/forex/deposit";

const SelectNetworkBase = ({}) => {
  const { t } = useTranslation();
  const {
    selectedCurrency,
    setSelectedCurrency,
    selectedDepositMethod,
    setSelectedDepositMethod,
    setStep,
    depositMethods,
  } = useDepositStore();
  if (!depositMethods || depositMethods.length === 0) {
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
              {depositMethods.map((item, index) => (
                <div
                  className={`cursor-pointer rounded border transition-colors duration-300 ${
                    selectedDepositMethod?.chain === item.chain
                      ? "cursor-pointer rounded-sm border border-primary-600 bg-white transition-colors duration-30 dark:border-primary-400 dark:bg-muted-950"
                      : "group relative cursor-pointer rounded-sm border border-muted-200 bg-muted-100 transition-colors duration-300 hover:border-primary-600 hover:bg-white dark:border-muted-800 dark:bg-muted-800 dark:hover:border-primary-400 dark:hover:bg-muted-900"
                  }`}
                  key={index}
                  onClick={() => {
                    setSelectedDepositMethod(item);
                  }}
                >
                  <div className="flex items-center justify-between gap-5 px-4 py-3 font-sans text-muted-600 text-sm transition-colors duration-300">
                    <div className="flex gap-10">
                      <div className="flex items-center justify-start gap-2">
                        <Avatar
                          alt={item.chain}
                          size="sm"
                          src={
                            `/img/crypto/${(
                              item.id || item.chain
                            ).toLowerCase()}.webp` || "/img/placeholder.svg"
                          }
                        />
                        <span className="font-semibold text-md text-muted-800 dark:text-muted-200">
                          {item.chain}
                        </span>
                      </div>
                      <div className="flex flex-col text-sm">
                        <div className="flex gap-1">
                          <span className="text-muted-500 dark:text-muted-400">
                            {t("Minimum Deposit")}
                          </span>
                          <span className="text-muted-800 dark:text-muted-200">
                            {item.limits?.deposit?.min ||
                              item.limits?.amount?.min ||
                              0}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <span className="text-muted-500 dark:text-muted-400">
                            {t("Maximum Deposit")}
                          </span>
                          <span className="text-muted-800 dark:text-muted-200">
                            {item.limits?.deposit?.max ||
                              item.limits?.amount?.max ||
                              "Unlimited"}
                          </span>
                        </div>
                        {item.fee && item.fee?.min && (
                          <div className="flex gap-1">
                            <span className="text-muted-500 dark:text-muted-400">
                              {t("Minimum Fee")}
                            </span>
                            <span className="text-muted-800 dark:text-muted-200">
                              {item.fee.min} {selectedCurrency}
                            </span>
                          </div>
                        )}
                        {item.fee && item.fee?.percentage && (
                          <div className="flex gap-1">
                            <span className="text-muted-500 dark:text-muted-400">
                              {t("Percentage Fee")}
                            </span>
                            <span className="text-muted-800 dark:text-muted-200">
                              {item.fee.percentage}%
                            </span>
                          </div>
                        )}
                        {item.fixedFee && (
                          <div className="flex gap-1">
                            <span className="text-muted-500 dark:text-muted-400">
                              {t("Fixed Deposit Fee")}
                            </span>
                            <span className="text-muted-800 dark:text-muted-200">
                              {item.fixedFee}
                            </span>
                          </div>
                        )}
                        {item.percentageFee && (
                          <div className="flex gap-1">
                            <span className="text-muted-500 dark:text-muted-400">
                              {t("Percentage Deposit Fee")}
                            </span>
                            <span className="text-muted-800 dark:text-muted-200">
                              {item.percentageFee}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16! max-w-sm">
          <div className="flex w-full justify-center gap-4">
            <Button
              className="w-full"
              onClick={() => {
                setSelectedCurrency("Select a currency");
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
              disabled={!selectedDepositMethod}
              onClick={() => {
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
export const SelectNetwork = memo(SelectNetworkBase);

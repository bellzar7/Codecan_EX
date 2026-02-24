import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import { memo } from "react";
import Button from "@/components/elements/base/button/Button";
import { MashImage } from "@/components/elements/MashImage";
import { useDepositStore } from "@/stores/user/wallet/deposit";
import type { SelectFiatDepositMethodProps } from "./SelectFiatDepositMethod.types";

const SelectFiatDepositMethodBase = ({}: SelectFiatDepositMethodProps) => {
  const { t } = useTranslation();
  const {
    selectedCurrency,
    setSelectedCurrency,
    depositMethods,
    selectedDepositMethod,
    setSelectedDepositMethod,
    setStep,
  } = useDepositStore();
  return (
    <div>
      <div className="mb-12 space-y-1 text-center font-sans">
        <h2 className="font-light text-2xl text-muted-800 dark:text-muted-100">
          {t("Select a Payment Method")}
        </h2>
        <p className="text-muted-400 text-sm">
          {t("Pick one of the following payment methods to deposit funds.")}
        </p>
      </div>

      <div className="mx-auto mb-4 w-full max-w-xl space-y-5 rounded-sm px-8 pb-8">
        {depositMethods?.gateways?.map((gateway) => (
          <div
            className={
              selectedDepositMethod?.alias === gateway.alias
                ? "cursor-pointer rounded-sm border border-primary-600 bg-white transition-colors duration-30 dark:border-primary-400 dark:bg-muted-950"
                : "group relative cursor-pointer rounded-sm border border-muted-200 bg-muted-100 transition-colors duration-300 hover:border-primary-600 hover:bg-white dark:border-muted-800 dark:bg-muted-800 dark:hover:border-primary-400 dark:hover:bg-muted-900"
            }
            key={gateway.id}
            onClick={() => {
              setSelectedDepositMethod(gateway, null);
            }}
          >
            <div className="flex items-center justify-between gap-5 p-3 font-sans text-muted-600 text-sm transition-colors duration-300">
              <div className="flex items-center gap-4">
                <MashImage
                  alt={gateway.name}
                  className="h-24 w-24 rounded-md"
                  src={gateway.image}
                />
                <div>
                  <h3 className="font-medium text-lg text-muted-800 dark:text-muted-100">
                    {gateway.title}
                  </h3>
                  <p className="text-muted-500 text-sm dark:text-muted-400">
                    {gateway.description}
                  </p>
                </div>
              </div>
              <div className="flex w-32 min-w-32 flex-col items-start gap-2">
                <span className="text-muted-500 text-sm dark:text-muted-400">
                  {gateway.fixedFee} {selectedCurrency}
                </span>
                <span className="text-muted-500 text-sm dark:text-muted-400">
                  {gateway.percentageFee}%
                </span>
              </div>
            </div>
          </div>
        ))}
        {depositMethods?.methods?.map((method) => (
          <div
            className={
              selectedDepositMethod?.id === method.id
                ? "cursor-pointer rounded-sm border border-primary-600 bg-white transition-colors duration-30 dark:border-primary-400 dark:bg-muted-950"
                : "group relative cursor-pointer rounded-sm border border-muted-200 bg-muted-100 transition-colors duration-300 hover:border-primary-600 hover:bg-white dark:border-muted-800 dark:bg-muted-800 dark:hover:border-primary-400 dark:hover:bg-muted-900"
            }
            key={method.id}
            onClick={() => {
              setSelectedDepositMethod(method, null);
            }}
          >
            <div className="[&>div]:peer-checked:flex! flex items-center justify-between gap-5 p-3 font-sans text-muted-600 text-sm transition-colors duration-300 peer-hover:bg-muted-100 dark:text-muted-400 dark:peer-hover:bg-muted-800 [&>button]:peer-checked:hidden">
              <div className="flex items-center gap-4">
                <MashImage
                  alt={method.name}
                  className="h-24 w-24 rounded-md"
                  src={method.image}
                />
                <div>
                  <h3 className="font-medium text-lg text-muted-800 dark:text-muted-100">
                    {method.title}
                  </h3>
                  <p className="text-muted-500 text-sm dark:text-muted-400">
                    {method.instructions}
                  </p>
                </div>
              </div>
              <div className="flex w-32 min-w-32 flex-col items-start gap-2">
                <span className="text-muted-500 text-sm dark:text-muted-400">
                  Flat Fee: {method.fixedFee} {selectedCurrency}
                </span>
                <span className="text-muted-500 text-sm dark:text-muted-400">
                  Fee: {method.percentageFee}%
                </span>
              </div>
            </div>
          </div>
        ))}
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
              disabled={!selectedDepositMethod || selectedDepositMethod === ""}
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
export const SelectFiatDepositMethod = memo(SelectFiatDepositMethodBase);

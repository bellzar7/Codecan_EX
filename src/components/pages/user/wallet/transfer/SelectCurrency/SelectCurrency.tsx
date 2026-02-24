import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import { memo } from "react";
import Button from "@/components/elements/base/button/Button";
import ComboBox from "@/components/elements/form/combobox/ComboBox";
import { useTransferStore } from "@/stores/user/wallet/transfer";

const SelectCurrencyBase = ({}) => {
  const { t } = useTranslation();
  const {
    selectedWalletType,
    selectedTargetWalletType,
    setSelectedWalletType,
    currencies,
    selectedCurrency,
    setSelectedCurrency,
    targetCurrency,
    setTargetCurrency,
    setStep,
    transferType,
  } = useTransferStore();

  return (
    <div>
      <div className="mb-12 space-y-1 text-center font-sans">
        <h2 className="font-light text-2xl text-muted-800 dark:text-muted-100">
          {t("Select a")} {selectedWalletType.label} {t("Source Currency")}
        </h2>
        <p className="text-muted-400 text-sm">
          {t("Choose the currency you want to transfer")}
        </p>
      </div>

      <div className="mx-auto mb-4 w-full max-w-lg rounded-sm px-4 pb-8 md:px-8">
        <div className="flex flex-col gap-5">
          <ComboBox
            label={t("Source Currency")}
            loading={!currencies?.from}
            options={currencies?.from}
            selected={selectedCurrency}
            setSelected={setSelectedCurrency}
          />
          {transferType.value === "wallet" &&
            !["ECO", "FUTURES"].includes(selectedTargetWalletType?.value) && (
              <ComboBox
                label={t("Target Currency")}
                loading={!currencies?.to}
                options={currencies?.to}
                selected={targetCurrency}
                setSelected={setTargetCurrency}
              />
            )}
        </div>
        <div className="px-8">
          <div className="mx-auto mt-12 max-w-sm">
            <div className="flex w-full justify-center gap-4">
              <Button
                className="w-full"
                onClick={() => {
                  setSelectedWalletType({
                    value: "",
                    label: "Select a wallet type",
                  });
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
                disabled={
                  !selectedCurrency || selectedCurrency === "Select a currency"
                }
                onClick={() => {
                  setStep(5);
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
    </div>
  );
};

export const SelectCurrency = memo(SelectCurrencyBase);

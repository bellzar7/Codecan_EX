import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import { memo } from "react";
import Button from "@/components/elements/base/button/Button";
import ComboBox from "@/components/elements/form/combobox/ComboBox";
import { useWithdrawStore } from "@/stores/user/forex/withdraw";

const SelectCurrencyBase = ({}) => {
  const { t } = useTranslation();
  const {
    selectedWalletType,
    setSelectedWalletType,
    currencies,
    selectedCurrency,
    setSelectedCurrency,
    setSelectedWithdrawMethod,
    setStep,
    fetchWithdrawMethods,
  } = useWithdrawStore();
  return (
    <div>
      <div className="mb-12 space-y-1 text-center font-sans">
        <h2 className="font-light text-2xl text-muted-800 dark:text-muted-100">
          {t("Select a")} {selectedWalletType.label} {t("Currency")}
        </h2>
        <p className="text-muted-400 text-sm">
          {t("Pick one of the following currencies to continue")}
        </p>
      </div>

      <div className="mx-auto mb-4 w-full max-w-lg rounded-sm px-4 pb-8 md:px-8">
        <div>
          <ComboBox
            loading={!currencies}
            options={currencies}
            selected={selectedCurrency}
            setSelected={setSelectedCurrency}
          />
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
                disabled={
                  !selectedCurrency || selectedCurrency === "Select a currency"
                }
                onClick={() => {
                  if (selectedWalletType.value !== "FIAT") {
                    fetchWithdrawMethods();
                  }
                  setStep(selectedWalletType.value === "FIAT" ? 4 : 3);
                  setSelectedWithdrawMethod(null);
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

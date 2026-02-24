import { Icon } from "@iconify/react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { memo } from "react";
import Button from "@/components/elements/base/button/Button";
import ListBox from "@/components/elements/form/listbox/Listbox";
import { useWithdrawStore } from "@/stores/user/forex/withdraw";

const SelectWalletTypeBase = ({}) => {
  const { t } = useTranslation();
  const {
    walletTypes,
    selectedWalletType,
    setSelectedWalletType,
    setStep,
    fetchCurrencies,
  } = useWithdrawStore();
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
        <ListBox
          options={walletTypes}
          selected={selectedWalletType}
          setSelected={setSelectedWalletType}
        />

        <div className="mt-6">
          <Button
            className="w-full"
            color="primary"
            disabled={selectedWalletType.value === ""}
            onClick={() => {
              fetchCurrencies();
              setStep(2);
            }}
            size="lg"
            type="button"
          >
            {t("Continue")}
            <Icon className="h-5 w-5" icon="mdi:chevron-right" />
          </Button>
        </div>
        <hr className="my-6 border-muted-200 border-t dark:border-muted-800" />
        <div className="text-center">
          <p className="mt-8 space-x-2 font-sans text-muted-600 text-sm leading-5 dark:text-muted-400">
            <span>{t("Having any trouble")}</span>
            <Link
              className="font-medium text-primary-600 underline-offset-4 transition duration-150 ease-in-out hover:text-primary-500 hover:underline focus:underline focus:outline-hidden"
              href="#"
            >
              {t("Contact us")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export const SelectWalletType = memo(SelectWalletTypeBase);

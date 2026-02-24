import { Icon } from "@iconify/react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { memo, useState } from "react";
import Button from "@/components/elements/base/button/Button";
import Input from "@/components/elements/form/input/Input";
import ListBox from "@/components/elements/form/listbox/Listbox";
import { useTransferStore } from "@/stores/user/wallet/transfer";

const SelectTransferTypeBase = () => {
  const { t } = useTranslation();
  const { setStep, setTransferType, transferType, setClientId } =
    useTransferStore();
  const transferTypes = [
    { value: "client", label: "Transfer to Client Wallet" },
    { value: "wallet", label: "Transfer Between Wallets" },
  ];
  const [selectedTransferType, setSelectedTransferType]: any =
    useState(transferType);

  const [clientId, setLocalClientId] = useState("");

  const handleContinue = () => {
    setTransferType(selectedTransferType);
    if (selectedTransferType.value === "client") {
      setClientId(clientId);
    }
    setStep(2);
  };

  return (
    <div>
      <div className="mb-12 space-y-1 text-center font-sans">
        <h2 className="font-light text-2xl text-muted-800 dark:text-muted-100">
          {t("Select Transfer Type")}
        </h2>
        <p className="text-muted-400 text-sm">
          {t("Choose the type of transfer you want to make")}
        </p>
      </div>

      <div className="mx-auto mb-4 w-full max-w-lg rounded-sm px-8 pb-8">
        <ListBox
          options={transferTypes}
          selected={selectedTransferType}
          setSelected={setSelectedTransferType}
        />
        {selectedTransferType.value === "client" && (
          <div className="mt-4">
            <Input
              label={t("Client ID")}
              onChange={(e) => setLocalClientId(e.target.value)}
              placeholder={t("Enter Client ID")}
              required
              type="text"
              value={clientId}
            />
          </div>
        )}
        <div className="mt-6">
          <Button
            className="w-full"
            color="primary"
            disabled={
              selectedTransferType.value === "client" && clientId === ""
            }
            onClick={handleContinue}
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

export const SelectTransferType = memo(SelectTransferTypeBase);

import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import { memo, useCallback, useMemo } from "react";
import Button from "@/components/elements/base/button/Button";
import Input from "@/components/elements/form/input/Input";
import { useTransferStore } from "@/stores/user/wallet/transfer";

const LoadingIndicator = () => {
  const { t } = useTranslation();
  return (
    <div className="flex h-96 items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Icon
          className="h-12 w-12 animate-spin text-primary-500"
          icon="mdi:loading"
        />
        <p className="text-primary-500 text-xl">
          {t("Processing transfer...")}
        </p>
      </div>
    </div>
  );
};

const TransferDetails = ({ selectedCurrency, remainingBalance, details }) => {
  const { t } = useTranslation();

  return (
    <div className="card-dashed mt-5 space-y-2 text-sm">
      <div className="flex justify-between">
        <p className="text-muted-600 dark:text-muted-300">
          {t("Remaining Balance")}
        </p>
        <p className="text-muted-600 dark:text-muted-300">
          {remainingBalance > 0 ? remainingBalance : "--"} {selectedCurrency}
        </p>
      </div>

      {/* Additional details based on transfer type */}
      {details.fromCurrency && details.fromType && (
        <>
          <div className="flex justify-between">
            <p className="text-muted-600 dark:text-muted-300">
              {t("From Currency")}
            </p>
            <p className="text-muted-600 dark:text-muted-300">
              {details.fromCurrency}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-muted-600 dark:text-muted-300">
              {t("From Type")}
            </p>
            <p className="text-muted-600 dark:text-muted-300">
              {details.fromType}
            </p>
          </div>
        </>
      )}

      {details.toType && (
        <>
          <div className="flex justify-between">
            <p className="text-muted-600 dark:text-muted-300">{t("To Type")}</p>
            <p className="text-muted-600 dark:text-muted-300">
              {details.toType}
            </p>
          </div>
        </>
      )}

      {details.toClient && (
        <div className="flex justify-between">
          <p className="text-muted-600 dark:text-muted-300">{t("To Client")}</p>
          <p className="text-muted-600 dark:text-muted-300">
            {details.toClient}
          </p>
        </div>
      )}
    </div>
  );
};

const TransferForm = ({
  selectedCurrency,
  onBack,
  onTransfer,
  loading,
  transferDetails,
}) => {
  const { transferAmount, setTransferAmount } = useTransferStore();

  const handleChangeAmount = useCallback(
    (e) => {
      const value = Number.parseFloat(e.target.value);
      if (value >= 0) setTransferAmount(value);
    },
    [setTransferAmount]
  );

  const { t } = useTranslation();

  return (
    <div>
      <div className="mb-12 space-y-1 text-center font-sans">
        <h2 className="font-light text-2xl text-muted-800 dark:text-muted-100">
          {transferDetails.fromType} {t("to")} {transferDetails.toType}{" "}
          {t("Transfer Confirmation")}
        </h2>
        <p className="text-muted-400 text-sm">
          {t("Enter the amount you want to transfer")}
        </p>
      </div>
      <div className="mx-auto mb-4 w-full max-w-md rounded-sm px-8 pb-8">
        <Input
          label={t("Amount")}
          min="0"
          onChange={handleChangeAmount}
          placeholder={t("Enter amount")}
          required
          type="number"
          value={transferAmount}
        />
        <TransferDetails
          details={transferDetails}
          remainingBalance={transferDetails.remainingBalance}
          selectedCurrency={selectedCurrency}
        />
        <div className="mx-auto mt-8! max-w-sm">
          <div className="flex w-full justify-center gap-4">
            <Button disabled={loading} onClick={onBack} size="lg" type="button">
              <Icon className="h-5 w-5" icon="mdi:chevron-left" />
              {t("Go Back")}
            </Button>
            <Button
              color="primary"
              disabled={!transferDetails.isTransferValid || loading}
              onClick={onTransfer}
              size="lg"
              type="button"
            >
              {t("Transfer")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TransferAmountBase = () => {
  const {
    loading,
    setStep,
    selectedCurrency,
    handleTransfer,
    selectedWalletType,
    selectedTargetWalletType,
    transferAmount,
    currencies,
    transferType,
    clientId,
  } = useTransferStore();

  const balance = useMemo(() => {
    return (
      currencies?.from
        ?.find((currency) => currency.value === selectedCurrency)
        ?.label.split(" - ")[1] || 0
    );
  }, [currencies, selectedCurrency]);

  const remainingBalance = useMemo(
    () => balance - transferAmount,
    [balance, transferAmount]
  );

  const transferDetails = useMemo(() => {
    const details = {
      fromType: selectedWalletType?.label || "N/A",
      toType:
        transferType.value === "client"
          ? "Client"
          : selectedTargetWalletType?.label || "N/A",
      fromCurrency: selectedCurrency || "N/A",
      remainingBalance,
      isTransferValid: transferAmount > 0 && remainingBalance >= 0,
      toClient: transferType.value === "client" ? clientId || "N/A" : undefined,
    };
    return details;
  }, [
    selectedWalletType,
    selectedTargetWalletType,
    selectedCurrency,
    transferType,
    clientId,
    remainingBalance,
    transferAmount,
  ]);

  if (loading) return <LoadingIndicator />;

  return (
    <TransferForm
      loading={loading}
      onBack={() => {
        setStep(4);
      }}
      onTransfer={handleTransfer}
      selectedCurrency={selectedCurrency}
      transferDetails={transferDetails}
    />
  );
};

export const TransferAmount = memo(TransferAmountBase);

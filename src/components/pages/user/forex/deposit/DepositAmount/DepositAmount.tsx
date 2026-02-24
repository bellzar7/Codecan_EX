import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { memo, useCallback, useMemo } from "react";
import Button from "@/components/elements/base/button/Button";
import Input from "@/components/elements/form/input/Input";
import { useDepositStore } from "@/stores/user/forex/deposit";

// Loading indicator component
const LoadingIndicator = () => {
  const { t } = useTranslation();
  return (
    <div className="flex h-96 items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Icon
          className="h-12 w-12 animate-spin text-primary-500"
          icon="mdi:loading"
        />
        <p className="text-primary-500 text-xl">{t("Processing deposit...")}</p>
      </div>
    </div>
  );
};
// Displays deposital details like min/max amounts and fees
const DepositDetails = ({
  selectedDepositMethod,
  selectedCurrency,
  depositAmount,
  balance,
  fee,
  minFee,
  totalDeposit,
  remainingBalance,
}) => {
  const { t } = useTranslation();
  return (
    <div className="card-dashed mt-5 text-sm">
      <div className="mb-2 font-semibold text-md text-muted-800 dark:text-muted-100">
        {selectedDepositMethod?.chain} {t("Network Deposit Information")}
      </div>
      <div className="flex justify-between">
        <p className="text-muted-600 dark:text-muted-300">{t("Min Amount")}</p>
        <p
          className={
            !depositAmount ||
            depositAmount < selectedDepositMethod?.limits?.deposit?.min
              ? "text-red-500"
              : "text-muted-600 dark:text-muted-300"
          }
        >
          {selectedDepositMethod?.limits?.deposit?.min || 0}{" "}
        </p>
      </div>
      <div className="flex justify-between">
        <p className="text-muted-600 dark:text-muted-300">{t("Max Amount")}</p>
        <p className="text-muted-600 dark:text-muted-300">
          {balance || selectedDepositMethod?.limits?.deposit?.max}{" "}
        </p>
      </div>
      <div className="mb-2 flex justify-between border-muted-300 border-b border-dashed pb-2 dark:border-muted-700">
        <p className="text-muted-600 dark:text-muted-300">
          {t("Deposit Fee")}{" "}
          {minFee > 0 && (depositAmount * fee) / 100 < minFee && (
            <span className="text-muted-600 dark:text-muted-300">
              {t("Min Fee")} ({minFee})
            </span>
          )}
        </p>
        <p className="text-muted-600 dark:text-muted-300">{fee}</p>
      </div>

      <div className="mb-2 flex justify-between border-muted-300 border-b border-dashed pb-2 dark:border-muted-700">
        <p className="text-muted-600 dark:text-muted-300">
          {t("Total Deposit")}
        </p>
        <p className="text-muted-600 dark:text-muted-300">{totalDeposit}</p>
      </div>
      <div className="flex justify-between">
        <p className="text-muted-600 dark:text-muted-300">
          {t("Remaining Balance")}
        </p>
        <p className="text-muted-600 dark:text-muted-300">
          {remainingBalance > 0 ? remainingBalance : "--"} {selectedCurrency}
        </p>
      </div>
    </div>
  );
};
const calculateFees = (method, amount) => {
  let fee = 0;
  let percentageFee = 0;
  let minFee = 0;
  // Apply fixed fee if available
  if (method.fixedFee) {
    fee += method.fixedFee;
  }
  // Apply percentage fee if available
  if (method.percentageFee) {
    percentageFee = method.percentageFee;
    fee += (percentageFee * amount) / 100;
  }
  // Apply dynamic fee structure if available
  if (typeof method.fee === "object") {
    percentageFee = Number.parseFloat(method.fee?.percentage || 0);
    if (percentageFee > 0) {
      fee += (percentageFee * amount) / 100;
    }
    minFee = Number.parseFloat(method.fee?.min || 0);
    if (minFee > 0) {
      fee = Math.max(minFee, fee); // Ensures that the fee does not fall below minFee
    }
  }
  return { fee, minFee };
};
const DepositForm = ({
  selectedWalletType,
  selectedCurrency,
  onBack,
  onDeposit,
  loading,
}) => {
  const { depositAmount, setDepositAmount, currencies, selectedDepositMethod } =
    useDepositStore();
  const balance = useMemo(() => {
    return (
      currencies
        .find((currency) => currency.value === selectedCurrency)
        ?.label.split(" - ")[1] || 0
    );
  }, [currencies, selectedCurrency]);
  const handleChangeAmount = useCallback(
    (e) => {
      setDepositAmount(Number.parseFloat(e.target.value));
    },
    [setDepositAmount]
  );
  // Calculate fees
  const { fee, minFee } = useMemo(() => {
    return selectedWalletType.value === "FIAT"
      ? { fee: 0, minFee: 0 }
      : calculateFees(selectedDepositMethod, depositAmount || 0);
  }, [selectedDepositMethod, depositAmount]);
  const totalDeposit = useMemo(
    () => (depositAmount || 0) + fee,
    [depositAmount, fee]
  );
  const remainingBalance = useMemo(
    () => balance - totalDeposit,
    [balance, totalDeposit]
  );
  const isDepositValid = useMemo(() => {
    return (
      depositAmount > 0 &&
      remainingBalance >= 0 &&
      depositAmount >= (selectedDepositMethod?.limits?.deposit?.min || 0) &&
      depositAmount <= (balance || selectedDepositMethod?.limits?.deposit?.max)
    );
  }, [depositAmount, remainingBalance, balance, selectedDepositMethod]);
  const { t } = useTranslation();
  return (
    <div>
      <div className="mb-12 space-y-1 text-center font-sans">
        <h2 className="font-light text-2xl text-muted-800 dark:text-muted-100">
          {selectedCurrency} {t("Deposit Confirmation")}
        </h2>
        <p className="text-muted-400 text-sm">
          {t("Enter the amount you want to deposit")}
        </p>
      </div>
      <div className="mx-auto mb-4 w-full max-w-md rounded-sm px-8 pb-8">
        <Input
          error={
            depositAmount &&
            depositAmount < (selectedDepositMethod?.limits?.deposit?.min || 0)
              ? "Amount is less than minimum"
              : undefined ||
                  depositAmount >
                    (balance || selectedDepositMethod?.limits?.deposit?.max)
                ? "Amount is more your balance"
                : undefined
          }
          label={t("Amount")}
          max={balance || selectedDepositMethod?.limits?.deposit?.max}
          min={selectedDepositMethod?.limits?.deposit?.min || 0}
          onChange={handleChangeAmount}
          placeholder={t("Enter amount")}
          required
          type="number"
          value={depositAmount}
        />
        <DepositDetails
          balance={balance}
          depositAmount={depositAmount}
          fee={fee}
          minFee={minFee}
          remainingBalance={remainingBalance}
          selectedCurrency={selectedCurrency}
          selectedDepositMethod={selectedDepositMethod}
          totalDeposit={totalDeposit}
        />
        <div className="mx-auto mt-8! max-w-sm">
          <div className="flex w-full justify-center gap-4">
            <Button disabled={loading} onClick={onBack} size="lg" type="button">
              <Icon className="h-5 w-5" icon="mdi:chevron-left" />
              {t("Go Back")}
            </Button>
            <Button
              color="primary"
              disabled={!isDepositValid || loading}
              onClick={onDeposit}
              size="lg"
              type="button"
            >
              {t("Deposit")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
const DepositAmountBase = () => {
  const {
    loading,
    setStep,
    selectedCurrency,
    handleDeposit,
    setSelectedDepositMethod,
    selectedWalletType,
  } = useDepositStore();
  const router = useRouter();
  const { id } = router.query as {
    id: string;
  };
  if (loading || !id) return <LoadingIndicator />;
  return (
    <DepositForm
      loading={loading}
      onBack={() => {
        setSelectedDepositMethod(null);
        setStep(selectedWalletType.value === "FIAT" ? 2 : 3);
      }}
      onDeposit={() => handleDeposit(id)}
      selectedCurrency={selectedCurrency}
      selectedWalletType={selectedWalletType}
    />
  );
};
export const DepositAmount = memo(DepositAmountBase);

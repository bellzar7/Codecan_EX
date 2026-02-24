import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/components/elements/base/button/Button";
import Input from "@/components/elements/form/input/Input";
import { useDashboardStore } from "@/stores/dashboard";
import { useWithdrawStore } from "@/stores/user/wallet/withdraw";

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
          {t("Processing withdrawal...")}
        </p>
      </div>
    </div>
  );
};

const WithdrawDetails = ({
  selectedWithdrawMethod,
  selectedCurrency,
  withdrawAmount,
  balance,
  fee,
  minFee,
  totalWithdraw,
  remainingBalance,
}) => {
  const { t } = useTranslation();
  return (
    <div className="card-dashed mt-5 text-sm">
      <div className="mb-2 font-semibold text-md text-muted-800 dark:text-muted-100">
        {selectedWithdrawMethod?.chain} {t("Network Withdraw Information")}
      </div>
      <div className="flex justify-between">
        <p className="text-muted-600 dark:text-muted-300">{t("Min Amount")}</p>
        <p
          className={
            !withdrawAmount ||
            withdrawAmount < selectedWithdrawMethod?.limits?.withdraw?.min
              ? "text-red-500"
              : "text-muted-600 dark:text-muted-300"
          }
        >
          {selectedWithdrawMethod?.limits?.withdraw?.min || 0}{" "}
        </p>
      </div>
      <div className="flex justify-between">
        <p className="text-muted-600 dark:text-muted-300">{t("Max Amount")}</p>
        <p className="text-muted-600 dark:text-muted-300">
          {balance || selectedWithdrawMethod?.limits?.withdraw?.max}{" "}
        </p>
      </div>
      <div className="mb-2 flex justify-between border-muted-300 border-b border-dashed pb-2 dark:border-muted-700">
        <p className="text-muted-600 dark:text-muted-300">
          {t("Withdraw Fee")}{" "}
          {minFee > 0 && (withdrawAmount * fee) / 100 < minFee && (
            <span className="text-muted-600 dark:text-muted-300">
              {t("Min Fee")} ({minFee})
            </span>
          )}
        </p>
        <p className="text-muted-600 dark:text-muted-300">{fee}</p>
      </div>

      <div className="mb-2 flex justify-between border-muted-300 border-b border-dashed pb-2 dark:border-muted-700">
        <p className="text-muted-600 dark:text-muted-300">
          {t("Total Withdraw")}
        </p>
        <p className="text-muted-600 dark:text-muted-300">{totalWithdraw}</p>
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

const calculateFees = (method, amount, spotWithdrawFee = 0) => {
  let fee = 0;
  // let percentageFee = 0;
  let minFee = 0;

  // Fixed Fee
  // if (method.fixedFee) {
  //   fee += method.fixedFee;
  // }

  // Percentage Fee from the method
  // if (method.percentageFee) {
  //   percentageFee = method.percentageFee;
  //   fee += (percentageFee * amount) / 100;
  // }

  // Handle combined percentage fee: system percentage + spotWithdrawFee
  const combinedPercentageFee =
    Number.parseFloat(method?.fee?.percentage || "0") +
    Number.parseFloat(spotWithdrawFee.toString());
  if (combinedPercentageFee > 0) {
    fee += (combinedPercentageFee * amount) / 100;
  }

  // Minimum Fee logic
  minFee = Number.parseFloat(method?.fee?.min || 0);
  if (minFee > 0) {
    fee = Math.max(minFee, fee);
  }

  return { fee, minFee };
};

const WithdrawForm = ({ selectedCurrency, onBack, onWithdraw, loading }) => {
  const { profile } = useDashboardStore();

  const { settings } = useDashboardStore();
  const {
    withdrawAmount,
    setWithdrawAmount,
    withdrawAddress,
    setWithdrawAddress,
    currencies,
    selectedWithdrawMethod,
    setSelectedWithdrawMethod,
  } = useWithdrawStore();

  useEffect(() => {
    if (
      Array.isArray(profile?.customAddressWalletsPairFields) &&
      profile.customAddressWalletsPairFields.length > 0
    ) {
      const currentAddress = profile.customAddressWalletsPairFields.find(
        (obj) => obj.currency === selectedCurrency
      );
      setSelectedWithdrawMethod({ chain: currentAddress?.network || "" });
    }
  }, [profile]);

  // Get the current spotWithdrawFee from settings
  const spotWithdrawFee = Number.parseFloat(settings?.spotWithdrawFee || 0);

  // Local state to handle input as a string
  const [inputValue, setInputValue] = useState(withdrawAmount.toString());

  const balance = useMemo(() => {
    return (
      currencies
        .find((currency) => currency.value === selectedCurrency)
        ?.label.split(" - ")[1] || 0
    );
  }, [currencies, selectedCurrency]);

  const handleChangeAddress = useCallback(
    (e) => {
      setWithdrawAddress(e.target.value);
    },
    [setWithdrawAddress]
  );

  const handleChangeAmount = useCallback(
    (e) => {
      const value = e.target.value;
      // Update local input value
      setInputValue(value);

      // Only update the store if the value is a valid number
      if (value === "" || (!isNaN(value) && Number.parseFloat(value) >= 0)) {
        setWithdrawAmount(Number.parseFloat(value) || 0);
      }
    },
    [setWithdrawAmount]
  );

  // Calculate fee with spotWithdrawFee included
  const { fee, minFee } = useMemo(() => {
    return calculateFees(
      selectedWithdrawMethod,
      withdrawAmount || 0,
      spotWithdrawFee
    );
  }, [selectedWithdrawMethod, withdrawAmount, spotWithdrawFee]);

  const totalWithdraw = useMemo(
    () => (withdrawAmount || 0) + fee,
    [withdrawAmount, fee]
  );

  const remainingBalance = useMemo(() => {
    return balance - totalWithdraw;
  }, [balance, totalWithdraw]);

  const isWithdrawValid = useMemo(() => {
    return (
      withdrawAmount > 0 &&
      withdrawAddress &&
      remainingBalance >= 0 &&
      withdrawAmount >= (selectedWithdrawMethod?.limits?.withdraw?.min || 0) &&
      withdrawAmount <=
        (balance || selectedWithdrawMethod?.limits?.withdraw?.max)
    );
  }, [
    withdrawAmount,
    withdrawAddress,
    remainingBalance,
    balance,
    selectedWithdrawMethod,
  ]);

  const { t } = useTranslation();

  return (
    <div>
      <div className="mb-12 space-y-1 text-center font-sans">
        <h2 className="font-light text-2xl text-muted-800 dark:text-muted-100">
          {selectedCurrency} {t("Withdraw Confirmation")}
        </h2>
        <p className="text-muted-400 text-sm">
          {t("Enter the amount you want to withdraw")}
        </p>
      </div>
      <div className="mx-auto mb-4 w-full max-w-md rounded-sm px-8 pb-8">
        <Input
          label={t("Address")}
          onChange={handleChangeAddress}
          placeholder={t("Enter address")}
          required
          type="text"
          value={withdrawAddress}
        />

        <Input
          error={
            withdrawAmount &&
            withdrawAmount <
              (selectedWithdrawMethod?.limits?.withdraw?.min || 0)
              ? "Amount is less than minimum"
              : undefined ||
                  withdrawAmount >
                    (balance || selectedWithdrawMethod?.limits?.withdraw?.max)
                ? "Amount exceeds your balance"
                : undefined
          }
          label={t("Amount")}
          max={balance || selectedWithdrawMethod?.limits?.withdraw?.max}
          min="0"
          onChange={handleChangeAmount}
          placeholder={t("Enter amount")}
          required
          step={selectedWithdrawMethod?.limits?.withdraw?.min || "any"}
          type="text"
          value={inputValue}
        />
        <WithdrawDetails
          balance={balance}
          fee={fee}
          minFee={minFee}
          remainingBalance={remainingBalance}
          selectedCurrency={selectedCurrency}
          selectedWithdrawMethod={selectedWithdrawMethod}
          totalWithdraw={totalWithdraw}
          withdrawAmount={withdrawAmount}
        />
        <div className="mx-auto mt-8! max-w-sm">
          <div className="flex w-full justify-center gap-4">
            <Button disabled={loading} onClick={onBack} size="lg" type="button">
              <Icon className="h-5 w-5" icon="mdi:chevron-left" />
              {t("Go Back")}
            </Button>
            <Button
              color="primary"
              disabled={!isWithdrawValid || loading}
              onClick={onWithdraw}
              size="lg"
              type="button"
            >
              {t("Withdraw")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const WithdrawAmountBase = () => {
  const {
    loading,
    setStep,
    selectedCurrency,
    handleWithdraw,
    setSelectedWithdrawMethod,
  } = useWithdrawStore();

  if (loading) return <LoadingIndicator />;

  return (
    <WithdrawForm
      loading={loading}
      onBack={() => {
        setSelectedWithdrawMethod(null);
        setStep(2);
      }}
      onWithdraw={handleWithdraw}
      selectedCurrency={selectedCurrency}
    />
  );
};

export const WithdrawAmount = memo(WithdrawAmountBase);

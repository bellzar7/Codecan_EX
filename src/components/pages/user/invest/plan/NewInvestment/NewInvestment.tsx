import Link from "next/link";
import { useTranslation } from "next-i18next";
import { memo } from "react";
import Button from "@/components/elements/base/button/Button";
import Input from "@/components/elements/form/input/Input";
import ListBox from "@/components/elements/form/listbox/Listbox";

const NewInvestmentBase = ({
  plan,
  duration,
  setDuration,
  amount,
  setAmount,
  invest,
  isLoading,
}) => {
  const { t } = useTranslation();
  const looseToNumber = (value: any) => {
    if (
      typeof value === "string" &&
      (value === "" || value === "." || value.endsWith("."))
    ) {
      return value; // Allow incomplete decimal inputs
    }
    const n = Number.parseFloat(value);
    return Number.isNaN(n) ? value : n;
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-semibold text-lg text-muted-800 dark:text-muted-100">
            {t("Investment Plan Details")}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <p className="text-muted-400 text-sm">{t("Min Amount")}</p>
            <p className="text-muted-800 text-sm dark:text-muted-100">
              {plan?.minAmount} {plan?.currency}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-muted-400 text-sm">{t("Max Amount")}</p>
            <p className="text-muted-800 text-sm dark:text-muted-100">
              {plan?.maxAmount} {plan?.currency}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-muted-400 text-sm">{t("Profit Percentage")}</p>
            <p className="text-success-500">{plan?.profitPercentage}%</p>
          </div>
          <div className="flex justify-between">
            <p className="text-muted-400 text-sm">{t("Wallet Type")}</p>
            <Link href={`/user/wallet/${plan?.walletType}`}>
              <span className="text-primary-500">{plan?.walletType}</span>
            </Link>
          </div>
          <div className="flex justify-between">
            <p className="text-muted-400 text-sm">{t("Currency")}</p>
            <Link href={`/user/wallet/${plan?.walletType}/${plan?.currency}`}>
              <span className="text-primary-500">{plan?.currency}</span>
            </Link>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="w-full">
          <ListBox
            label={t("Duration")}
            options={plan?.durations?.map((duration) => ({
              value: duration.id,
              label: `${duration.duration} ${duration.timeframe}`,
            }))}
            selected={duration}
            setSelected={(e) => setDuration(e)}
          />
        </div>
        <div className="w-full">
          <Input
            label={t("Amount")}
            onChange={(e) => setAmount(looseToNumber(e.target.value))}
            placeholder={t("Ex: 2600")}
            step="any"
            type="number"
            value={amount}
          />
        </div>
      </div>
      <div>
        <Button
          className="w-full"
          color={
            amount && amount >= plan?.minAmount && duration.value
              ? "success"
              : "muted"
          }
          disabled={
            !amount || // Ensure the amount is provided
            isNaN(amount) || // Avoid invalid numbers
            (plan ? amount < plan.minAmount : false) || // Check min limit
            (plan ? amount > plan?.maxAmount : false) || // Check max limit
            !duration.value // Ensure duration is selected
          }
          loading={isLoading}
          onClick={invest}
          type="button"
        >
          <span>{t("Invest")}</span>
        </Button>
      </div>
    </div>
  );
};
export const NewInvestment = memo(NewInvestmentBase);

import { useTranslation } from "next-i18next";
import { memo } from "react";

const StakeLogInfoBase = ({ log }) => {
  const { t } = useTranslation();
  const stakedAmount = log.amount;
  const interestRate = log.duration?.interestRate;
  const estimatedEarnings = (stakedAmount * interestRate) / 100;
  return (
    <div className="rounded-lg bg-muted-100 p-4 dark:bg-muted-900">
      <div className="flex flex-col divide-y divide-muted-200 rounded-lg border border-muted-200 bg-white text-center md:flex-row md:divide-x md:divide-y-0 dark:divide-muted-800 dark:border-muted-800 dark:bg-muted-950">
        <div className="my-2 flex-1 py-3">
          <h3 className="mb-1 flex items-center justify-center gap-1 text-muted-500 text-sm leading-tight dark:text-muted-400">
            {t("Staked Amount")}
          </h3>
          <span className="font-semibold text-lg text-muted-800 dark:text-muted-100">
            {stakedAmount}
          </span>
        </div>
        <div className="my-2 flex-1 py-3">
          <h3 className="mb-1 text-muted-500 text-sm leading-tight dark:text-muted-400">
            {t("Interest Rate")}
          </h3>
          <span className="font-semibold text-lg text-primary-500">
            {interestRate}%
          </span>
        </div>
        <div className="my-2 flex-1 py-3">
          <h3 className="mb-1 text-muted-500 text-sm leading-tight dark:text-muted-400">
            {t("Estimated Earnings")}
          </h3>
          <span className="font-semibold text-lg text-success-500">
            {estimatedEarnings}
          </span>
        </div>
      </div>
    </div>
  );
};
export const StakeLogInfo = memo(StakeLogInfoBase);

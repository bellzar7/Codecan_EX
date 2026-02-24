import { Icon } from "@iconify/react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { memo } from "react";

const StakingInfoBase = ({
  hasStaked,
  selectedPool,
  wallet,
  selectedDuration,
  amount,
}) => {
  const { t } = useTranslation();
  if (!(selectedPool && wallet)) {
    console.error("StakingInfo component received invalid props");
    return null;
  }
  const stakedAmount = hasStaked
    ? selectedPool.stakingLogs?.[0]?.amount || 0
    : amount || 0;
  const interestRate = hasStaked
    ? selectedPool.stakingLogs?.[0]?.duration?.interestRate || 0
    : selectedPool.stakingDurations?.find(
        (d) => d.id === selectedDuration?.value
      )?.interestRate || 0;
  const estimatedEarnings = (stakedAmount * interestRate) / 100;
  return (
    <div className="rounded-lg bg-muted-100 p-4 dark:bg-muted-900">
      <div className="flex flex-col divide-y divide-muted-200 rounded-lg border border-muted-200 bg-white text-center md:flex-row md:divide-x md:divide-y-0 dark:divide-muted-800 dark:border-muted-800 dark:bg-muted-950">
        <div className="my-2 flex-1 py-3">
          <h3 className="mb-1 flex items-center justify-center gap-1 text-muted-500 text-sm leading-tight dark:text-muted-400">
            {hasStaked ? (
              "Staked Amount"
            ) : (
              <>
                {t("Balance")}
                <Link href={"/user/wallet/deposit"}>
                  <Icon
                    className="h-5 w-5 cursor-pointer hover:text-primary-500"
                    icon="mdi:plus"
                  />
                </Link>
              </>
            )}
          </h3>
          <span className="font-semibold text-lg text-muted-800 dark:text-muted-100">
            {hasStaked ? (
              stakedAmount
            ) : (
              <>
                {wallet.balance || 0} {selectedPool.currency}
              </>
            )}
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
export const StakingInfo = memo(StakingInfoBase);

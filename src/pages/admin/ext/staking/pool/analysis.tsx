// pages/chart.tsx

import { useTranslation } from "next-i18next";
import { AnalyticsChart } from "@/components/charts/AnalyticsChart";
import Layout from "@/layouts/Default";

const path = "/admin/ext/staking/pool";
const StakingsAnalytics = () => {
  const { t } = useTranslation();
  const availableFilters: AvailableFilters = {
    status: [
      {
        value: "ACTIVE",
        label: "active",
        color: "success",
        icon: "ph:circle",
        path: `${path}?status=ACTIVE`,
      },
      {
        value: "COMPLETED",
        label: "completed",
        color: "success",
        icon: "ph:check-circle",
        path: `${path}?status=COMPLETED`,
      },
      {
        value: "INACTIVE",
        label: "inactive",
        color: "warning",
        icon: "ph:x-circle",
        path: `${path}?status=INACTIVE`,
      },
    ],
  };
  return (
    <Layout color="muted" title={t("Staking Pools Analytics")}>
      <AnalyticsChart
        availableFilters={availableFilters}
        cardName={t("Pools")}
        color="primary"
        model="stakingPool"
        modelName={t("Staking Pools")}
      />
    </Layout>
  );
};
export default StakingsAnalytics;
export const permission = "Access Staking Pool Management";

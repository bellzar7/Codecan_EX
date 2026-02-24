// pages/chart.tsx

import { useTranslation } from "next-i18next";
import { AnalyticsChart } from "@/components/charts/AnalyticsChart";
import Layout from "@/layouts/Default";

const path = "/admin/ext/staking/log";
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
        value: "RELEASED",
        label: "released",
        color: "info",
        icon: "mingcute:alert-line",
        path: `${path}?status=RELEASED`,
      },
      {
        value: "COLLECTED",
        label: "collected",
        color: "success",
        icon: "ph:check-circle",
        path: `${path}?status=COLLECTED`,
      },
    ],
  };
  return (
    <Layout color="muted" title={t("Staking Rewards Analytics")}>
      <AnalyticsChart
        availableFilters={availableFilters}
        cardName={t("Rewards")}
        color="primary"
        model="stakingLog"
        modelName={t("Staking Rewards")}
      />
    </Layout>
  );
};
export default StakingsAnalytics;
export const permission = "Access Staking Management";

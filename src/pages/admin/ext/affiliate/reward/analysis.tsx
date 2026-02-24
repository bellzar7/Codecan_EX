// pages/chart.tsx

import { useTranslation } from "next-i18next";
import { AnalyticsChart } from "@/components/charts/AnalyticsChart";
import Layout from "@/layouts/Default";

const path = "/admin/ext/affiliate/reward";
const ReferralRewardsAnalytics = () => {
  const { t } = useTranslation();
  const availableFilters: AvailableFilters = {
    isClaimed: [
      {
        value: "true",
        label: "claimed",
        color: "success",
        icon: "ph:check-circle",
        path: `${path}?isClaimed=true`,
      },
      {
        value: "false",
        label: "unclaimed",
        color: "danger",
        icon: "ph:x-circle",
        path: `${path}?isClaimed=false`,
      },
    ],
  };
  return (
    <Layout color="muted" title={t("Referral Rewards Analytics")}>
      <AnalyticsChart
        availableFilters={availableFilters}
        cardName={t("Rewards")}
        color="primary"
        model="mlmReferralReward"
        modelName={t("Referral Rewards")}
      />
    </Layout>
  );
};
export default ReferralRewardsAnalytics;
export const permission = "Access MLM Referral Reward Management";

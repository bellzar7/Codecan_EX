// pages/chart.tsx

import { useTranslation } from "next-i18next";
import { AnalyticsChart } from "@/components/charts/AnalyticsChart";
import Layout from "@/layouts/Default";

const path = "/user/affiliate/reward";
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
        color: "warning",
        icon: "ph:circle",
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
        path={"/api/ext/affiliate/referral/analysis"}
        pathModel
      />
    </Layout>
  );
};
export default ReferralRewardsAnalytics;

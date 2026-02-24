// pages/chart.tsx

import { useTranslation } from "next-i18next";
import { AnalyticsChart } from "@/components/charts/AnalyticsChart";
import Layout from "@/layouts/Default";

const path = "/admin/ext/affiliate/referral";
const ReferralsAnalytics = () => {
  const { t } = useTranslation();
  const availableFilters: AvailableFilters = {
    status: [
      {
        value: "PENDING",
        label: "pending",
        color: "warning",
        icon: "ph:stop-circle",
        path: `${path}?status=PENDING`,
      },
      {
        value: "ACTIVE",
        label: "active",
        color: "success",
        icon: "ph:check-circle",
        path: `${path}?status=ACTIVE`,
      },
      {
        value: "REJECTED",
        label: "rejected",
        color: "danger",
        icon: "ph:x-circle",
        path: `${path}?status=REJECTED`,
      },
    ],
  };
  return (
    <Layout color="muted" title={t("Referrals Analytics")}>
      <AnalyticsChart
        availableFilters={availableFilters}
        color="primary"
        model="mlmReferral"
        modelName={t("Referrals")}
      />
    </Layout>
  );
};
export default ReferralsAnalytics;
export const permission = "Access MLM Referral Management";

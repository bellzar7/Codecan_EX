// pages/chart.tsx

import { useTranslation } from "next-i18next";
import { AnalyticsChart } from "@/components/charts/AnalyticsChart";
import Layout from "@/layouts/Default";

const path = "/admin/ext/ico/contribution";
const IcoContributionsAnalytics = () => {
  const { t } = useTranslation();
  const availableFilters: AvailableFilters = {
    status: [
      {
        value: "PENDING",
        label: "pending",
        color: "warning",
        icon: "ph:circle",
        path: `${path}?status=PENDING`,
      },
      {
        value: "COMPLETED",
        label: "completed",
        color: "success",
        icon: "ph:check-circle",
        path: `${path}?status=COMPLETED`,
      },
      {
        value: "CANCELLED",
        label: "cancelled",
        color: "muted",
        icon: "ph:stop-circle",
        path: `${path}?status=CANCELLED`,
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
    <Layout color="muted" title={t("Ico Contributions Analytics")}>
      <AnalyticsChart
        availableFilters={availableFilters}
        cardName={t("Contributions")}
        color="primary"
        model="icoContribution"
        modelName={t("Ico Contributions")}
      />
    </Layout>
  );
};
export default IcoContributionsAnalytics;
export const permission = "Access ICO Contribution Management";

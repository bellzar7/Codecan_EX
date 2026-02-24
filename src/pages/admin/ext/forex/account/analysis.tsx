// pages/chart.tsx

import { useTranslation } from "next-i18next";
import { AnalyticsChart } from "@/components/charts/AnalyticsChart";
import Layout from "@/layouts/Default";

const path = "/admin/ext/forex/account";
const ForexAccountsAnalytics = () => {
  const { t } = useTranslation();
  const availableFilters: AvailableFilters = {
    type: [
      {
        value: "LIVE",
        label: "Live",
        color: "success",
        icon: "ph:check-circle",
        path: `${path}?type=true`,
      },
      {
        value: "DEMO",
        label: "Demo",
        color: "danger",
        icon: "ph:x-circle",
        path: `${path}?type=false`,
      },
    ],
  };
  return (
    <Layout color="muted" title={t("Forex Accounts Analytics")}>
      <AnalyticsChart
        availableFilters={availableFilters}
        cardName={t("Accounts")}
        color="primary"
        model="forexAccount"
        modelName={t("Forex Accounts")}
      />
    </Layout>
  );
};
export default ForexAccountsAnalytics;
export const permission = "Access Forex Account Management";

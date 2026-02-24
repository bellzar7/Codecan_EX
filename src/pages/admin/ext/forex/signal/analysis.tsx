// pages/chart.tsx

import { useTranslation } from "next-i18next";
import { AnalyticsChart } from "@/components/charts/AnalyticsChart";
import Layout from "@/layouts/Default";

const path = "/admin/ext/forex/signal";
const ForexSignalsAnalytics = () => {
  const { t } = useTranslation();
  const availableFilters: AvailableFilters = {
    status: [
      {
        value: "LIVE",
        label: "Live",
        color: "success",
        icon: "ph:check-circle",
        path: `${path}?status=true`,
      },
      {
        value: "DEMO",
        label: "Demo",
        color: "danger",
        icon: "ph:x-circle",
        path: `${path}?status=false`,
      },
    ],
  };
  return (
    <Layout color="muted" title={t("Forex Signals Analytics")}>
      <AnalyticsChart
        availableFilters={availableFilters}
        cardName={t("Signals")}
        color="primary"
        model="forexSignal"
        modelName={t("Forex Signals")}
      />
    </Layout>
  );
};
export default ForexSignalsAnalytics;
export const permission = "Access Forex Signal Management";

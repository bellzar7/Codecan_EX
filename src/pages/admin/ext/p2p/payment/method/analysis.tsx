// pages/chart.tsx

import { useTranslation } from "next-i18next";
import { AnalyticsChart } from "@/components/charts/AnalyticsChart";
import Layout from "@/layouts/Default";

const path = "/admin/ext/p2p/paymentMethod";
const P2PsAnalytics = () => {
  const { t } = useTranslation();
  const availableFilters: AvailableFilters = {
    status: [
      {
        value: "true",
        label: "Active",
        color: "success",
        icon: "ph:check-circle",
        path: `${path}?status=true`,
      },
      {
        value: "false",
        label: "Disabled",
        color: "danger",
        icon: "ph:x-circle",
        path: `${path}?status=false`,
      },
    ],
  };
  return (
    <Layout color="muted" title={t("P2P Payment Methods Analytics")}>
      <AnalyticsChart
        availableFilters={availableFilters}
        cardName={t("Payment Method")}
        color="primary"
        model="p2pPaymentMethod"
        modelName={t("P2P Payment Methods")}
      />
    </Layout>
  );
};
export default P2PsAnalytics;
export const permission = "Access P2P Payment Method Management";

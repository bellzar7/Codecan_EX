// pages/chart.tsx

import { useTranslation } from "next-i18next";
import { AnalyticsChart } from "@/components/charts/AnalyticsChart";
import Layout from "@/layouts/Default";

const path = "/admin/ext/p2p/dispute";
const P2PsAnalytics = () => {
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
        value: "OPEN",
        label: "open",
        color: "primary",
        icon: "ph:stop-circle",
        path: `${path}?status=OPEN`,
      },
      {
        value: "RESOLVED",
        label: "resolved",
        color: "success",
        icon: "ph:check-circle",
        path: `${path}?status=RESOLVED`,
      },
      {
        value: "CANCELLED",
        label: "cancelled",
        color: "danger",
        icon: "ph:x-circle",
        path: `${path}?status=CANCELLED`,
      },
    ],
  };
  return (
    <Layout color="muted" title={t("P2P Disputes Analytics")}>
      <AnalyticsChart
        availableFilters={availableFilters}
        cardName={t("Disputes")}
        color="primary"
        model="p2pDispute"
        modelName={t("P2P Disputes")}
      />
    </Layout>
  );
};
export default P2PsAnalytics;
export const permission = "Access P2P Dispute Management";

// pages/chart.tsx

import { useTranslation } from "next-i18next";
import { AnalyticsChart } from "@/components/charts/AnalyticsChart";
import Layout from "@/layouts/Default";

const P2pCommissionsAnalytics = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("P2P Commissions Analytics")}>
      <AnalyticsChart
        cardName={t("Commissions")}
        color="primary"
        model="p2pCommission"
        modelName={t("P2P Commissions")}
      />
    </Layout>
  );
};
export default P2pCommissionsAnalytics;
export const permission = "Access P2P Commission Management";

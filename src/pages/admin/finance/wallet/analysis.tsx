// pages/chart.tsx

import { useTranslation } from "next-i18next";
import { AnalyticsChart } from "@/components/charts/AnalyticsChart";
import Layout from "@/layouts/Default";

const path = "/admin/finance/wallet";
const WalletsAnalytics = () => {
  const { t } = useTranslation();
  const availableFilters: AvailableFilters = {
    type: [
      {
        value: "FIAT",
        label: "Fiat",
        color: "success",
        icon: "ph:circle",
        path: `${path}?type=FIAT`,
      },
      {
        value: "SPOT",
        label: "Spot",
        color: "success",
        icon: "ph:check-circle",
        path: `${path}?type=SPOT`,
      },
      {
        value: "ECO",
        label: "Eco",
        color: "warning",
        icon: "ph:x-circle",
        path: `${path}?type=ECO`,
      },
    ],
  };
  return (
    <Layout color="muted" title={t("Wallets Analytics")}>
      <AnalyticsChart
        availableFilters={availableFilters}
        cardName={t("Wallets")}
        color="primary"
        model="wallet"
        modelName={t("Wallets")}
      />
    </Layout>
  );
};
export default WalletsAnalytics;
export const permission = "Access Wallet Management";

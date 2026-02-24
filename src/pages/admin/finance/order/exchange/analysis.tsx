// pages/chart.tsx

import { useTranslation } from "next-i18next";
import { AnalyticsChart } from "@/components/charts/AnalyticsChart";
import Layout from "@/layouts/Default";

const path = "/admin/finance/order/exchange";
const ExchangeOrdersAnalytics = () => {
  const { t } = useTranslation();
  const availableFilters: AvailableFilters = {
    status: [
      {
        value: "OPEN",
        label: "Open",
        color: "warning",
        icon: "ph:circle",
        path: `${path}?status=OPEN`,
      },
      {
        value: "CLOSED",
        label: "Closed",
        color: "success",
        icon: "ph:check-circle",
        path: `${path}?status=CLOSED`,
      },
      {
        value: "CANCELED",
        label: "Canceled",
        color: "danger",
        icon: "ph:x-circle",
        path: `${path}?status=CANCELED`,
      },
      {
        value: "EXPIRED",
        label: "Expired",
        color: "primary",
        icon: "ph:minus-circle",
        path: `${path}?status=EXPIRED`,
      },
      {
        value: "REJECTED",
        label: "Rejected",
        color: "danger",
        icon: "ph:x-circle",
        path: `${path}?status=REJECTED`,
      },
    ],
    side: [
      {
        value: "BUY",
        label: "Buy",
        color: "success",
        icon: "ph:arrow-up",
        path: `${path}?side=BUY`,
      },
      {
        value: "SELL",
        label: "Sell",
        color: "danger",
        icon: "ph:arrow-down",
        path: `${path}?side=SELL`,
      },
    ],
    type: [
      {
        value: "MARKET",
        label: "Market",
        color: "primary",
        icon: "ph:arrows-left-right",
        path: `${path}?type=MARKET`,
      },
      {
        value: "LIMIT",
        label: "Limit",
        color: "primary",
        icon: "ph:arrows-left-right",
        path: `${path}?type=LIMIT`,
      },
    ],
  };
  return (
    <Layout color="muted" title={t("Exchange Orders Analytics")}>
      <AnalyticsChart
        availableFilters={availableFilters}
        cardName={t("Orders")}
        color="primary"
        model="exchangeOrder"
        modelName={t("Exchange Orders")}
      />
    </Layout>
  );
};
export default ExchangeOrdersAnalytics;
export const permission = "Access Exchange Order Management";

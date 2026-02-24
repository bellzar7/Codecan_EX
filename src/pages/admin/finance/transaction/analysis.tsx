// pages/chart.tsx

import { useTranslation } from "next-i18next";
import { AnalyticsChart } from "@/components/charts/AnalyticsChart";
import Layout from "@/layouts/Default";

const path = "/admin/finance/transaction";
const TransactionsAnalytics = () => {
  const { t } = useTranslation();
  const availableFilters: AvailableFilters = {
    status: [
      {
        value: "PENDING",
        label: "Pending",
        color: "warning",
        icon: "ph:circle",
        path: `${path}?status=PENDING`,
      },
      {
        value: "COMPLETED",
        label: "Completed",
        color: "success",
        icon: "ph:check-circle",
        path: `${path}?status=COMPLETED`,
      },
      {
        value: "FAILED",
        label: "Failed",
        color: "danger",
        icon: "ph:x-circle",
        path: `${path}?status=FAILED`,
      },
      {
        value: "CANCELLED",
        label: "Cancelled",
        color: "danger",
        icon: "ph:x-circle",
        path: `${path}?status=CANCELLED`,
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
      {
        value: "REFUNDED",
        label: "Refunded",
        color: "warning",
        icon: "ph:circle",
        path: `${path}?status=REFUNDED`,
      },
      {
        value: "TIMEOUT",
        label: "Timeout",
        color: "danger",
        icon: "ph:x-circle",
        path: `${path}?status=TIMEOUT`,
      },
    ],
  };
  return (
    <Layout color="muted" title={t("Transactions Analytics")}>
      <AnalyticsChart
        availableFilters={availableFilters}
        cardName={t("Transactions")}
        color="primary"
        model="transaction"
        modelName={t("Transactions")}
      />
    </Layout>
  );
};
export default TransactionsAnalytics;
export const permission = "Access Transaction Management";

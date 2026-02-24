// pages/chart.tsx

import { useTranslation } from "next-i18next";
import { AnalyticsChart } from "@/components/charts/AnalyticsChart";
import Layout from "@/layouts/Default";

const path = "/admin/ext/ecommerce/review";
const EcommerceReviewsAnalytics = () => {
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
    <Layout color="muted" title={t("Ecommerce Reviews Analytics")}>
      <AnalyticsChart
        availableFilters={availableFilters}
        cardName={t("Reviews")}
        color="primary"
        model="ecommerceReview"
        modelName={t("Ecommerce Reviews")}
      />
    </Layout>
  );
};
export default EcommerceReviewsAnalytics;
export const permission = "Access Ecommerce Review Management";

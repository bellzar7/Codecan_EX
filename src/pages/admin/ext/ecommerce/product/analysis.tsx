// pages/chart.tsx

import { useTranslation } from "next-i18next";
import { AnalyticsChart } from "@/components/charts/AnalyticsChart";
import Layout from "@/layouts/Default";

const path = "/admin/ext/ecommerce/product";
const EcommerceProductsAnalytics = () => {
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
    <Layout color="muted" title={t("Ecommerce Products Analytics")}>
      <AnalyticsChart
        availableFilters={availableFilters}
        cardName={t("Products")}
        color="primary"
        model="ecommerceProduct"
        modelName={t("Ecommerce Products")}
      />
    </Layout>
  );
};
export default EcommerceProductsAnalytics;
export const permission = "Access Ecommerce Product Management";

// pages/chart.tsx

import { useTranslation } from "next-i18next";
import { AnalyticsChart } from "@/components/charts/AnalyticsChart";
import Layout from "@/layouts/Default";

const UsersAnalytics = () => {
  const { t } = useTranslation();
  const availableFilters: AvailableFilters = {
    status: [
      {
        value: "ACTIVE",
        label: "Active",
        color: "success",
        icon: "solar:user-check-bold-duotone",
        path: "/admin/crm/user?status=ACTIVE",
      },
      {
        value: "INACTIVE",
        label: "Inactive",
        color: "danger",
        icon: "solar:user-minus-bold-duotone",
        path: "/admin/crm/user?status=INACTIVE",
      },
      {
        value: "BANNED",
        label: "Banned",
        color: "warning",
        icon: "solar:user-block-bold-duotone",
        path: "/admin/crm/user?status=BANNED",
      },
      {
        value: "SUSPENDED",
        label: "Suspended",
        color: "info",
        icon: "solar:user-cross-bold-duotone",
        path: "/admin/crm/user?status=SUSPENDED",
      },
    ],
  };
  return (
    <Layout color="muted" title={t("Users Analytics")}>
      <AnalyticsChart
        availableFilters={availableFilters}
        color="primary"
        model="user"
        modelName={t("Users")}
      />
    </Layout>
  );
};
export default UsersAnalytics;
export const permission = "Access User Management";

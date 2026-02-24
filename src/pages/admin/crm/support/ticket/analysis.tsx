// pages/chart.tsx

import { useTranslation } from "next-i18next";
import { AnalyticsChart } from "@/components/charts/AnalyticsChart";
import Layout from "@/layouts/Default";

const SupportTicketAnalytics = () => {
  const { t } = useTranslation();
  const availableFilters: AvailableFilters = {
    // enum('PENDING', 'OPEN', 'REPLIED', 'CLOSED')
    status: [
      {
        value: "PENDING",
        label: "pending",
        color: "warning",
        icon: "ph:circle",
        path: "/admin/crm/support/ticket?status=PENDING",
      },
      {
        value: "OPEN",
        label: "open",
        color: "info",
        icon: "ph:stop-circle",
        path: "/admin/crm/support/ticket?status=OPEN",
      },
      {
        value: "REPLIED",
        label: "replied",
        color: "success",
        icon: "ph:check-circle",
        path: "/admin/crm/support/ticket?status=REPLIED",
      },
      {
        value: "CLOSED",
        label: "closed",
        color: "danger",
        icon: "ph:x-circle",
        path: "/admin/crm/support/ticket?status=CLOSED",
      },
    ],
    // enum('LOW', 'MEDIUM', 'HIGH')
    importance: [
      {
        value: "LOW",
        label: "low",
        color: "success",
        icon: "bx:signal-1",
        path: "/admin/crm/support/ticket?importance=LOW",
      },
      {
        value: "MEDIUM",
        label: "medium",
        color: "warning",
        icon: "bx:signal-3",
        path: "/admin/crm/support/ticket?importance=MEDIUM",
      },
      {
        value: "HIGH",
        label: "high",
        color: "danger",
        icon: "bx:signal-5",
        path: "/admin/crm/support/ticket?importance=HIGH",
      },
    ],
  };
  return (
    <Layout color="muted" title={t("Support Tickets Analytics")}>
      <AnalyticsChart
        availableFilters={availableFilters}
        color="primary"
        model="supportTicket"
        modelName={t("Support Tickets")}
      />
    </Layout>
  );
};
export default SupportTicketAnalytics;
export const permission = "Access Support Ticket Management";

import { useTranslation } from "next-i18next";
import { AnalyticsChart } from "@/components/charts/AnalyticsChart";
import Layout from "@/layouts/Default";

const path = "/admin/payment/intent";

const PaymentIntentAnalytics = () => {
  const { t } = useTranslation();

  const availableFilters: AvailableFilters = {
    status: [
      {
        value: "PENDING",
        label: "Pending",
        color: "warning",
        icon: "mdi:progress-clock",
        path: `${path}?status=PENDING`,
      },
      {
        value: "COMPLETED",
        label: "Completed",
        color: "success",
        icon: "mdi:check-circle",
        path: `${path}?status=COMPLETED`,
      },
      {
        value: "FAILED",
        label: "Failed",
        color: "danger",
        icon: "mdi:close-circle",
        path: `${path}?status=FAILED`,
      },
      {
        value: "EXPIRED",
        label: "Expired",
        color: "muted",
        icon: "mdi:timer-off",
        path: `${path}?status=EXPIRED`,
      },
    ],
  };

  return (
    <Layout color="muted" title={t("Payment Intent Analytics")}>
      <AnalyticsChart
        availableFilters={availableFilters}
        cardName={t("Payment Analytics")}
        color="primary"
        model="paymentIntent"
        modelName={t("Payment Intents")}
      />
    </Layout>
  );
};

export default PaymentIntentAnalytics;

export const permission = "Access Payment Gateway Management";

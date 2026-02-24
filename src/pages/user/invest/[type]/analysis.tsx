// pages/chart.tsx

import { capitalize } from "lodash";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import React, { useEffect } from "react";
import { AnalyticsChart } from "@/components/charts/AnalyticsChart";
import Layout from "@/layouts/Default";

const path = "/api/finance/investment";
const analysisPath = "/api/finance/investment/analysis";
const InvestmentsAnalytics = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { type } = router.query as {
    type: string;
  };
  const [availableFilters, setAvailableFilters] =
    React.useState<AvailableFilters | null>(null);
  useEffect(() => {
    if (router.isReady && type) {
      const filters: AvailableFilters = {
        status: [
          {
            value: "ACTIVE",
            label: "active",
            color: "primary",
            icon: "ph:circle",
            path: `${path}?status=ACTIVE`,
          },
          {
            value: "COMPLETED",
            label: "completed",
            color: "success",
            icon: "ph:check-circle",
            path: `${path}?status=COMPLETED`,
          },
          {
            value: "CANCELLED",
            label: "cancelled",
            color: "muted",
            icon: "ph:stop-circle",
            path: `${path}?status=CANCELLED`,
          },
          {
            value: "REJECTED",
            label: "rejected",
            color: "danger",
            icon: "ph:x-circle",
            path: `${path}?status=REJECTED`,
          },
        ],
      };
      setAvailableFilters(filters);
    }
  }, [router.isReady, type]);
  return (
    <Layout color="muted" title={`${capitalize(type)} Investments Analytics`}>
      {availableFilters && (
        <AnalyticsChart
          availableFilters={availableFilters}
          cardName={t("Investments")}
          color="primary"
          model={type === "general" ? "investment" : "forexInvestment"}
          modelName={`${capitalize(type)} Investments`}
          path={analysisPath}
          pathModel
        />
      )}
    </Layout>
  );
};
export default InvestmentsAnalytics;

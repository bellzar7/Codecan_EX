"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/finance/investment/duration";
const columnConfig: ColumnConfigType[] = [
  {
    field: "duration",
    label: "Duration",
    type: "number",
    sortable: true,
  },
  {
    field: "timeframe",
    label: "Timeframe",
    type: "select",
    sortable: true,
    options: [
      { value: "HOUR", label: "Hour", color: "primary" },
      { value: "DAY", label: "Day", color: "info" },
      { value: "WEEK", label: "Week", color: "success" },
      { value: "MONTH", label: "Month", color: "warning" },
    ],
  },
];
const InvestmentDurations = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Investment Durations")}>
      <DataTable
        canView={false}
        columnConfig={columnConfig}
        endpoint={api}
        isParanoid={false}
        title={t("Investment Durations")}
      />
    </Layout>
  );
};
export default InvestmentDurations;
export const permission = "Access Investment Duration Management";

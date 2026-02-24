"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/ext/forex/duration";
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
const ForexDurations = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Forex Durations")}>
      <DataTable
        canView={false}
        columnConfig={columnConfig}
        endpoint={api}
        isParanoid={false}
        title={t("Forex Durations")}
      />
    </Layout>
  );
};
export default ForexDurations;
export const permission = "Access Forex Duration Management";

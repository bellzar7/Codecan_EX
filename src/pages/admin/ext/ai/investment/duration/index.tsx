"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/ext/ai/investment/duration";
const columnConfig: ColumnConfigType[] = [
  {
    field: "duration",
    label: "Duration",
    type: "number",
    sortable: true,
    getValue: (item) => `${item.duration} ${item.timeframe?.toLowerCase()}`,
  },
  {
    field: "timeframe",
    label: "Timeframe",
    type: "text",
    sortable: true,
  },
];
const AIDurations = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("AI Investment Durations")}>
      <DataTable
        columnConfig={columnConfig}
        endpoint={api}
        isParanoid={false}
        title={t("AI Investment Durations")}
      />
    </Layout>
  );
};
export default AIDurations;
export const permission = "Access AI Investment Duration Management";

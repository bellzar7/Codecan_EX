"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/ext/ecosystem/market";
const columnConfig: ColumnConfigType[] = [
  {
    field: "symbol",
    label: "Symbol",
    type: "text",
    sortable: true,
    getValue: (item) =>
      `${item.currency?.toUpperCase()}/${item.pair?.toUpperCase()}`,
  },
  {
    field: "isTrending",
    label: "Trending",
    type: "select",
    sortable: true,
    options: [
      { value: true, label: "Yes", color: "success" },
      { value: false, label: "No", color: "danger" },
    ],
  },
  {
    field: "isHot",
    label: "Hot",
    type: "select",
    sortable: true,
    options: [
      { value: true, label: "Yes", color: "success" },
      { value: false, label: "No", color: "danger" },
    ],
  },
  {
    field: "status",
    label: "Status",
    type: "switch",
    sortable: true,
    api: `${api}/:id/status`,
  },
];
const Markets = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Ecosystem Markets")}>
      <DataTable
        canCreate={true}
        columnConfig={columnConfig}
        endpoint={api}
        isParanoid={false}
        title={t("Markets")}
      />
    </Layout>
  );
};
export default Markets;
export const permission = "Access Ecosystem Market Management";

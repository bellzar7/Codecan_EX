"use client";
import { formatDate } from "date-fns";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/ext/forex/plan";
const columnConfig: ColumnConfigType[] = [
  {
    field: "title",
    label: "Plan",
    sublabel: "createdAt",
    type: "text",
    sortable: true,
    hasImage: true,
    imageKey: "image",
    placeholder: "/img/placeholder.svg",
    getSubValue: (item) =>
      item.createdAt
        ? formatDate(new Date(item.createdAt), "MMM dd, yyyy")
        : "N/A",
  },
  {
    field: "minProfit",
    label: "Profit",
    sublabel: "maxProfit",
    type: "number",
    sortable: true,
  },
  {
    field: "minAmount",
    label: "Amount",
    sublabel: "maxAmount",
    type: "number",
    sortable: true,
  },
  {
    field: "trending",
    label: "Trending",
    type: "select",
    options: [
      { value: true, label: "Yes", color: "success" },
      { value: false, label: "No", color: "danger" },
    ],
    sortable: true,
  },
  {
    field: "status",
    label: "Status",
    type: "switch",
    sortable: false,
    api: `${api}/:id/status`,
  },
];
const ForexPlans = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Forex Plans")}>
      <DataTable
        columnConfig={columnConfig}
        endpoint={api}
        title={t("Forex Plans")}
      />
    </Layout>
  );
};
export default ForexPlans;
export const permission = "Access Forex Plan Management";

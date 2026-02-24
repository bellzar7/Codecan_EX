"use client";
import { formatDate } from "date-fns";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/ext/forex/signal";
const columnConfig: ColumnConfigType[] = [
  {
    field: "title",
    label: "Title",
    sublabel: "createdAt",
    type: "text",
    sortable: true,
    hasImage: true,
    imageKey: "image",
    placeholder: "/img/placeholder.svg",
    getSubValue: (item) => formatDate(new Date(item.createdAt), "MMM dd, yyyy"),
  },
  {
    field: "status",
    label: "Status",
    type: "switch",
    sortable: true,
    api: `${api}/:id/status`,
  },
];
const ForexSignals = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Forex Signals")}>
      <DataTable
        canView={false}
        columnConfig={columnConfig}
        endpoint={api}
        hasAnalytics
        title={t("Forex Signals")}
      />
    </Layout>
  );
};
export default ForexSignals;
export const permission = "Access Forex Signal Management";

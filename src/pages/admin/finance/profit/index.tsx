"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";
import { profitTypeOptions } from "@/utils/constants";

// Define the API endpoint for admin profits
const api = "/api/admin/finance/profit";

// Define the column configurations for the DataTable
const columnConfig: ColumnConfigType[] = [
  {
    field: "transaction",
    label: "Transaction ID",
    type: "text",
    getValue: (item) => item.transactionId || "N/A",
    sortable: true,
  },
  {
    field: "type",
    label: "Type",
    type: "select",
    options: profitTypeOptions,
    sortable: true,
  },
  {
    field: "amount",
    label: "Amount",
    type: "number",
    precision: 8,
    sortable: true,
  },
  {
    field: "currency",
    label: "Currency",
    type: "text",
    sortable: true,
  },
  {
    field: "chain",
    label: "Chain",
    type: "text",
    sortable: true,
  },
  // Created At
  {
    field: "createdAt",
    label: "Date",
    type: "date",
    sortable: true,
    getValue: (item) =>
      item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A",
  },
];

const AdminProfitManagement = () => {
  const { t } = useTranslation();

  return (
    <Layout color="muted" title={t("Profit Management")}>
      <DataTable
        canCreate={false}
        canEdit={false}
        columnConfig={columnConfig}
        endpoint={api}
        hasAnalytics
        isParanoid={false}
        title={t("Admin Profits")}
      />
    </Layout>
  );
};

export default AdminProfitManagement;
export const permission = "Access Admin Profits";

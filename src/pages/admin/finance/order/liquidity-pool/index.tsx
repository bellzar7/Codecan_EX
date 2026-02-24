"use client";
import { formatDate } from "date-fns";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/finance/order/liquidity-pool";

const columnConfig: ColumnConfigType[] = [
  {
    field: "symbol",
    label: "Symbol",
    type: "text",
    sortable: true,
    filterable: true,
  },
  {
    field: "currency",
    label: "Base Currency",
    type: "text",
    sortable: true,
    filterable: true,
  },
  {
    field: "pair",
    label: "Quote Currency",
    type: "text",
    sortable: true,
    filterable: true,
  },
  {
    field: "baseBalance",
    label: "Base Balance",
    type: "number",
    sortable: true,
    filterable: false,
  },
  {
    field: "quoteBalance",
    label: "Quote Balance",
    type: "number",
    sortable: true,
    filterable: false,
  },
  {
    field: "isActive",
    label: "Status",
    type: "switch",
    sortable: false,
    filterable: true,
    api: "/api/admin/finance/order/liquidity-pool/:id",
    options: [
      { value: true, label: "Active", color: "success" },
      { value: false, label: "Inactive", color: "danger" },
    ],
    placeholder: "Select status",
  },
  {
    field: "createdAt",
    label: "Created At",
    type: "date",
    sortable: true,
    filterable: false,
    getValue: (row) =>
      row.createdAt
        ? formatDate(new Date(row.createdAt), "yyyy-MM-dd HH:mm")
        : "-",
  },
];

const LiquidityPools = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Liquidity Pool Management")}>
      <DataTable
        canCreate={true}
        canDelete={true}
        canEdit={true}
        canView={true}
        columnConfig={columnConfig}
        endpoint={api}
        hasAnalytics={false}
        isCrud={true}
        title={t("Liquidity Pools")}
      />
    </Layout>
  );
};

export default LiquidityPools;
export const permission = "Access Liquidity Pool Management";

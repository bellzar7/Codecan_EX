"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/ext/ico/allocation";
const columnConfig: ColumnConfigType[] = [
  {
    field: "token.currency",
    label: "Token",
    sublabel: "token.chain",
    type: "text",
    sortable: true,
    sortName: "token.currency",
    hasImage: true,
    imageKey: "token.image",
    placeholder: "/img/placeholder.svg",
    className: "rounded-full",
    getValue: (row) => row.token?.currency,
    getSubValue: (row) => row.token?.chain,
  },
  {
    field: "name",
    label: "Name",
    type: "text",
    sortable: true,
  },
  {
    field: "percentage",
    label: "Percentage",
    type: "number",
    sortable: true,
  },
  {
    field: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "PENDING", label: "Pending", color: "warning" },
      { value: "COMPLETED", label: "Completed", color: "success" },
      { value: "CANCELLED", label: "Cancelled", color: "danger" },
      { value: "REJECTED", label: "Rejected", color: "danger" },
    ],
    sortable: true,
  },
];
const ICOAllocations = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("ICO Allocations")}>
      <DataTable
        canView={false}
        columnConfig={columnConfig}
        endpoint={api}
        title={t("ICO Allocations")}
      />
    </Layout>
  );
};
export default ICOAllocations;
export const permission = "Access ICO Allocation Management";

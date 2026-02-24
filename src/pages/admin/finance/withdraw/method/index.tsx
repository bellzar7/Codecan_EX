"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/finance/withdraw/method";
const columnConfig: ColumnConfigType[] = [
  {
    field: "title",
    label: "Title",
    type: "text",
    sortable: true,
    hasImage: true,
    imageKey: "image",
    placeholder: "/img/avatars/placeholder.webp",
  },
  {
    field: "processingTime",
    label: "Duration",
    type: "text",
    sortable: true,
  },
  {
    field: "fixedFee",
    label: "Fixed Fee",
    type: "number",
    sortable: true,
  },
  {
    field: "percentageFee",
    label: "% Fee",
    type: "number",
    sortable: true,
  },
  {
    field: "minAmount",
    label: "Min",
    type: "number",
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
const WithdrawalMethods = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Withdrawal Methods Management")}>
      <DataTable
        columnConfig={columnConfig}
        endpoint={api}
        title={t("Withdrawal Methods")}
      />
    </Layout>
  );
};
export default WithdrawalMethods;
export const permission = "Access Withdrawal Method Management";

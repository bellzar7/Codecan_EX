"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/finance/deposit/wallet";
const columnConfig: ColumnConfigType[] = [
  {
    field: "title",
    label: "Title",
    type: "text",
    sortable: true,
    hasImage: true,
    imageKey: "image",
    placeholder: "/img/placeholder.svg",
  },
  {
    field: "address",
    label: "Address",
    type: "text",
    sortable: true,
    hasImage: false,
    imageKey: "image",
    placeholder: "/img/placeholder.svg",
  },
  {
    field: "network",
    label: "Network",
    type: "text",
    sortable: true,
    hasImage: false,
    imageKey: "image",
    placeholder: "/img/placeholder.svg",
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
    label: "Min Amount",
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
const DepositMethods = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Deposit Wallets Management")}>
      <DataTable
        columnConfig={columnConfig}
        endpoint={api}
        title={t("Deposit Wallets")}
      />
    </Layout>
  );
};
export default DepositMethods;
export const permission = "Access Deposit Wallet Management";

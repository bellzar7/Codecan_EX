"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/finance/deposit/gateway";
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
const DepositGateways = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Deposit Gateways Management")}>
      <DataTable
        canCreate={false}
        canDelete={false}
        columnConfig={columnConfig}
        endpoint={api}
        isParanoid={false}
        title={t("Deposit Gateways")}
      />
    </Layout>
  );
};
export default DepositGateways;
export const permission = "Access Deposit Gateway Management";

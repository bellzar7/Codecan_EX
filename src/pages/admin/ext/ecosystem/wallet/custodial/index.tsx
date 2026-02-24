"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/ext/ecosystem/wallet/custodial";
const columnConfig: ColumnConfigType[] = [
  {
    field: "chain",
    label: "Master Wallet Chain",
    type: "text",
    getValue: (item) => `${item.masterWallet?.chain}`,
    sortable: true,
  },
  {
    field: "address",
    label: "Address",
    type: "text",
    sortable: true,
  },
  {
    field: "network",
    label: "Network",
    type: "text",
    sortable: true,
  },
  {
    field: "status",
    label: "Status",
    type: "select",
    sortable: true,
    options: [
      { value: "ACTIVE", label: "Active", color: "success" },
      { value: "INACTIVE", label: "Inactive", color: "warning" },
      { value: "SUSPENDED", label: "Suspended", color: "danger" },
    ],
  },
];
const CustodialWallets = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Ecosystem Custodial Wallets")}>
      <DataTable
        canDelete={false}
        canEdit={true}
        columnConfig={columnConfig}
        endpoint={api}
        isParanoid={false}
        title={t("Custodial Wallets")}
        viewPath="/admin/ext/ecosystem/wallet/custodial/[id]"
      />
    </Layout>
  );
};
export default CustodialWallets;
export const permission = "Access Ecosystem Custodial Wallet Management";

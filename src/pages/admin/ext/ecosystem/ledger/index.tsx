"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/ext/ecosystem/ledger";
const columnConfig: ColumnConfigType[] = [
  {
    field: "user",
    label: "User",
    sublabel: "wallet.user.email",
    type: "text",
    getValue: (item) =>
      `${item.wallet?.user?.firstName} ${item.wallet?.user?.lastName}`,
    getSubValue: (item) => item.wallet?.user?.email,
    path: "/admin/crm/user?email=[wallet.user.email]",
    sortable: true,
    sortName: "wallet.user.firstName",
    hasImage: true,
    imageKey: "wallet.user.avatar",
    placeholder: "/img/avatars/placeholder.webp",
    className: "rounded-full",
  },
  {
    field: "currency",
    label: "Currency",
    sublabel: "chain",
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
    field: "offchainDifference",
    label: "Offchain Difference",
    type: "number",
    sortable: true,
    precision: 2,
  },
];
const PrivateLedgers = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Ecosystem Private Ledgers")}>
      <DataTable
        canCreate={false}
        canDelete={false}
        canEdit={false}
        columnConfig={columnConfig}
        endpoint={api}
        title={t("Private Ledgers")}
      />
    </Layout>
  );
};
export default PrivateLedgers;
export const permission = "Access Ecosystem Private Ledger Management";

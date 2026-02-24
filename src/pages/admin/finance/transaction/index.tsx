"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";
import { statusOptions, transactionTypeOptions } from "@/utils/constants";

const api = "/api/admin/finance/transaction";
const columnConfig: ColumnConfigType[] = [
  {
    field: "id",
    label: "Transaction ID",
    type: "text",
    sortable: true,
  },
  {
    field: "user",
    label: "User",
    sublabel: "user.email",
    type: "text",
    getValue: (item) => `${item.user?.firstName} ${item.user?.lastName}`,
    getSubValue: (item) => item.user?.email,
    path: "/admin/crm/user?email=[user.email]",
    sortable: true,
    sortName: "user.firstName",
    hasImage: true,
    imageKey: "user.avatar",
    placeholder: "/img/avatars/placeholder.webp",
    className: "rounded-full",
  },
  {
    field: "walletId",
    label: "Wallet Currency",
    sublabel: "walletId",
    type: "text",
    sortable: true,
    getValue: (item) => `${item.wallet?.currency} (${item.wallet?.type})`,
    getSubValue: (item) => item.walletId,
  },
  {
    field: "type",
    label: "Type",
    type: "select",
    options: transactionTypeOptions,
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
    field: "fee",
    label: "Fee",
    type: "number",
    precision: 8,
    sortable: true,
  },
  {
    field: "status",
    label: "Status",
    type: "select",
    options: statusOptions,
    sortable: true,
  },
  {
    field: "createdAt",
    label: "Date",
    type: "date",
    sortable: true,
    filterable: false,
    getValue: (item) =>
      item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A",
  },
];
const WalletTransactions = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Transactions Management")}>
      <DataTable
        canCreate={false}
        columnConfig={columnConfig}
        endpoint={api}
        hasAnalytics
        title={t("Transactions")}
      />
    </Layout>
  );
};
export default WalletTransactions;
export const permission = "Access Transaction Management";

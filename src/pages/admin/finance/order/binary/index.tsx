"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/finance/order/binary";
const columnConfig: ColumnConfigType[] = [
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
    field: "symbol",
    label: "Symbol",
    type: "text",
    sortable: true,
  },
  {
    field: "price",
    label: "Price",
    type: "number",
    sortable: true,
  },
  {
    field: "closePrice",
    label: "Close Price",
    type: "number",
    sortable: true,
  },
  {
    field: "amount",
    label: "Amount",
    type: "number",
    sortable: true,
  },
  {
    field: "side",
    label: "Side",
    type: "select",
    sortable: true,
    options: [
      { value: "RISE", label: "Rise" },
      { value: "FALL", label: "Fall" },
    ],
  },
  {
    field: "status",
    label: "Status",
    type: "select",
    sortable: false,
    options: [
      { value: "PENDING", label: "Pending", color: "warning" },
      { value: "WIN", label: "Win", color: "success" },
      { value: "LOSS", label: "Loss", color: "danger" },
      { value: "DRAW", label: "Draw", color: "muted" },
    ],
  },
  {
    field: "isDemo",
    label: "Demo",
    type: "select",
    sortable: false,
    options: [
      { value: true, label: "Yes", color: "success" },
      { value: false, label: "No", color: "danger" },
    ],
  },
];
const BinaryOrders = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Binary Orders Management")}>
      <DataTable
        canCreate={false}
        columnConfig={columnConfig}
        endpoint={api}
        hasAnalytics
        title={t("Binary Orders")}
      />
    </Layout>
  );
};
export default BinaryOrders;
export const permission = "Access Binary Order Management";

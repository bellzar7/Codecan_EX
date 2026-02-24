"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/ext/payment/intent";
const columnConfig: ColumnConfigType[] = [
  {
    field: "user",
    label: "User",
    sublabel: "user.email",
    type: "text",
    getValue: (item) =>
      item.user ? `${item.user?.firstName} ${item.user?.lastName}` : "N/A",
    getSubValue: (item) => (item.user ? item.user?.email : "N/A"),
    path: "/admin/crm/user?email={user.email}",
    sortable: true,
    sortName: "user.firstName",
    hasImage: true,
    imageKey: "user.avatar",
    placeholder: "/img/avatars/placeholder.webp",
    className: "rounded-full",
  },
  {
    field: "amount",
    label: "Amount",
    type: "number",
    sortable: true,
  },
  {
    field: "currency",
    label: "Currency",
    type: "text",
    sortable: true,
  },
  {
    field: "tax",
    label: "Tax",
    type: "number",
    sortable: true,
  },
  {
    field: "discount",
    label: "Discount",
    type: "number",
    sortable: true,
  },
  {
    field: "products",
    label: "Products",
    type: "tags",
    key: "name",
    sortable: false,
    filterable: false,
  },
  {
    field: "ipnUrl",
    label: "IPN URL",
    type: "link",
    getValue: (row) => row.ipnUrl,
    sortable: false,
  },
  {
    field: "status",
    label: "Status",
    type: "select",
    sortable: true,
    options: [
      { value: "PENDING", label: "Pending", color: "warning" },
      { value: "COMPLETED", label: "Completed", color: "success" },
      { value: "FAILED", label: "Failed", color: "danger" },
      { value: "EXPIRED", label: "Expired", color: "danger" },
    ],
  },
];

const PaymentIntents = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Payment Intents")}>
      <DataTable
        canCreate={false}
        canEdit={false}
        columnConfig={columnConfig}
        endpoint={api}
        hasAnalytics
        isParanoid={false}
        title={t("Payment Intents")}
      />
    </Layout>
  );
};

export default PaymentIntents;

export const permission = "Access Payment Gateway Management";

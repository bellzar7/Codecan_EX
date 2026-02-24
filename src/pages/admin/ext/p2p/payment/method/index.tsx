"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/ext/p2p/payment/method";
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
    field: "name",
    label: "Name",
    type: "text",
    sortable: true,
    hasImage: true,
    imageKey: "image",
    placeholder: "/img/placeholder.svg",
  },
  {
    field: "currency",
    label: "Currency",
    type: "text",
    sortable: true,
  },
  {
    field: "walletType",
    label: "Wallet Type",
    type: "text",
    sortable: true,
  },
  {
    field: "status",
    label: "Status",
    type: "switch",
    sortable: true,
    api: `${api}/:id/status`,
  },
];
const P2pPaymentMethods = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("P2P Payment Methods")}>
      <DataTable
        canCreate={true}
        canEdit={true}
        columnConfig={columnConfig}
        endpoint={api}
        hasAnalytics
        title={t("P2P Payment Methods")}
      />
    </Layout>
  );
};
export default P2pPaymentMethods;
export const permission = "Access P2P Payment Method Management";

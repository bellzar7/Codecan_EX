"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/ext/p2p/review";
const columnConfig: ColumnConfigType[] = [
  {
    field: "reviewer",
    label: "Reviewer",
    sublabel: "reviewer.email",
    type: "text",
    getValue: (item) =>
      `${item.reviewer?.firstName} ${item.reviewer?.lastName}`,
    getSubValue: (item) => item.reviewer?.email,
    path: "/admin/crm/user?email=[reviewer.email]",
    sortable: true,
    sortName: "reviewer.firstName",
    hasImage: true,
    imageKey: "reviewer.avatar",
    placeholder: "/img/avatars/placeholder.webp",
    className: "rounded-full",
  },
  {
    field: "reviewed",
    label: "Reviewed",
    sublabel: "reviewed.email",
    type: "text",
    getValue: (item) =>
      `${item.reviewed?.firstName} ${item.reviewed?.lastName}`,
    getSubValue: (item) => item.reviewed?.email,
    path: "/admin/crm/user?email=[reviewed.email]",
    sortable: true,
    sortName: "reviewed.firstName",
    hasImage: true,
    imageKey: "reviewed.avatar",
    placeholder: "/img/avatars/placeholder.webp",
    className: "rounded-full",
  },
  {
    field: "offerId",
    label: "Offer ID",
    type: "text",
    sortable: true,
  },
  {
    field: "rating",
    label: "Rating",
    type: "rating",
    sortable: true,
  },
  {
    field: "comment",
    label: "Comment",
    type: "text",
    sortable: false,
  },
];
const P2pReviews = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("P2P Reviews")}>
      <DataTable
        canCreate={false}
        columnConfig={columnConfig}
        endpoint={api}
        title={t("P2P Reviews")}
      />
    </Layout>
  );
};
export default P2pReviews;
export const permission = "Access P2P Review Management";

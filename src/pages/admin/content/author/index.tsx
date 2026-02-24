"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/content/author";
const columnConfig: ColumnConfigType[] = [
  {
    field: "user",
    label: "Author",
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
    field: "status",
    label: "Status",
    type: "select",
    sortable: true,
    options: [
      { value: "PENDING", label: "Pending", color: "warning" },
      { value: "APPROVED", label: "Approved", color: "success" },
      { value: "REJECTED", label: "Rejected", color: "danger" },
    ],
  },
];
const Authors = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Authors")}>
      <DataTable
        canCreate={false}
        canView={false}
        columnConfig={columnConfig}
        endpoint={api}
        title={t("Authors")}
      />
    </Layout>
  );
};
export default Authors;
export const permission = "Access Author Management";

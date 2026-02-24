"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/crm/kyc/applicant";
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
    field: "level",
    label: "Level",
    type: "number",
    sortable: true,
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
    placeholder: "Select status",
  },
];
const KycApplications = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("KYC Applications Management")}>
      <DataTable
        canCreate={false}
        canEdit={false}
        columnConfig={columnConfig}
        endpoint={api}
        hasAnalytics
        title={t("KYC Applications")}
        viewPath="/admin/crm/kyc/applicant/[id]"
      />
    </Layout>
  );
};
export default KycApplications;
export const permission = "Access KYC Application Management";

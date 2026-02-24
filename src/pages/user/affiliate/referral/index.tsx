"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/ext/affiliate/referral";
const columnConfig: ColumnConfigType[] = [
  {
    field: "referred",
    label: "Referred",
    sublabel: "referred.email",
    type: "text",
    getValue: (item) =>
      `${item.referred?.firstName} ${item.referred?.lastName}`,
    getSubValue: (item) => item.referred?.email,
    sortable: true,
    sortName: "referred.firstName",
    hasImage: true,
    imageKey: "referred.avatar",
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
      { value: "ACTIVE", label: "Approved", color: "success" },
      { value: "REJECTED", label: "Rejected", color: "danger" },
    ],
  },
];
const MlmReferrals = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("MLM Referrals")}>
      <DataTable
        columnConfig={columnConfig}
        endpoint={api}
        hasAnalytics
        hasStructure={false}
        isCrud={false}
        postTitle={t("Referrals")}
        title={t("MLM")}
      />
    </Layout>
  );
};
export default MlmReferrals;

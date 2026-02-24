"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/ext/affiliate/reward";
const columnConfig: ColumnConfigType[] = [
  {
    field: "referrer",
    label: "Referrer",
    sublabel: "referrer.email",
    type: "text",
    getValue: (item) =>
      `${item.referrer?.firstName} ${item.referrer?.lastName}`,
    getSubValue: (item) => item.referrer?.email,
    path: "/admin/crm/user?email={referrer.email}",
    sortable: true,
    sortName: "referrer.firstName",
    hasImage: true,
    imageKey: "referrer.avatar",
    placeholder: "/img/avatars/placeholder.webp",
    className: "rounded-full",
  },
  {
    field: "condition.name",
    label: "Condition",
    type: "text",
    sortable: true,
    getValue: (row) => row.condition?.title,
  },
  {
    field: "reward",
    label: "Reward",
    type: "number",
    sortable: true,
    getValue: (row) => `${row.reward} ${row.condition?.rewardCurrency}`,
  },
  {
    field: "isClaimed",
    label: "Claimed",
    type: "switch",
    sortable: true,
    api: `${api}/:id/status`,
  },
];
const MlmReferralRewards = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("MLM Referral Rewards")}>
      <DataTable
        columnConfig={columnConfig}
        endpoint={api}
        hasAnalytics
        title={t("MLM Referral Rewards")}
      />
    </Layout>
  );
};
export default MlmReferralRewards;
export const permission = "Access MLM Referral Reward Management";

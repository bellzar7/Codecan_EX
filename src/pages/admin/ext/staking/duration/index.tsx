"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/ext/staking/duration";
const columnConfig: ColumnConfigType[] = [
  {
    field: "pool.name",
    label: "Pool",
    sublabel: "pool.id",
    type: "text",
    sortable: true,
    sortName: "pool.name",
    getValue: (row) => row.pool?.name,
    getSubValue: (row) => row.pool?.id,
    hasImage: true,
    imageKey: "pool.icon",
    placeholder: "/img/placeholder.svg",
    className: "rounded-full",
  },
  {
    field: "duration",
    label: "Duration (days)",
    type: "number",
    sortable: true,
  },
  {
    field: "interestRate",
    label: "ROI (%)",
    type: "number",
    sortable: true,
  },
];
const StakingDurations = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Staking Durations")}>
      <DataTable
        canView={false}
        columnConfig={columnConfig}
        endpoint={api}
        title={t("Staking Durations")}
      />
    </Layout>
  );
};
export default StakingDurations;
export const permission = "Access Staking Duration Management";

"use client";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/ext/staking/pool";
const columnConfig: ColumnConfigType[] = [
  {
    field: "name",
    label: "Name",
    type: "text",
    sortable: true,
    hasImage: true,
    imageKey: "icon",
    placeholder: "/img/placeholder.svg",
    className: "rounded-full",
  },
  {
    field: "currency",
    label: "Currency",
    sublabel: "type",
    type: "text",
    sortable: true,
    getValue: (row) => `${row.currency} ${row.chain ? `(${row.chain})` : ""}`,
  },
  {
    field: "minStake",
    label: "Limit",
    sublabel: "maxStake",
    type: "number",
    sortable: true,
  },
  {
    field: "status",
    label: "Status",
    type: "select",
    sortable: true,
    options: [
      { value: "ACTIVE", label: "Active", color: "success" },
      { value: "INACTIVE", label: "Inactive", color: "danger" },
      { value: "COMPLETED", label: "Completed", color: "info" },
    ],
  },
];
const StakingPools = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Staking Pools")}>
      <DataTable
        canCreate={false}
        columnConfig={columnConfig}
        editPath="/admin/ext/staking/pool/[id]"
        endpoint={api}
        hasAnalytics
        navSlot={
          <>
            <Link color="success" href="/admin/ext/staking/pool/create">
              <IconButton
                aria-label="Create Staking Pool"
                color="success"
                size="lg"
                variant="pastel"
              >
                <Icon className="h-6 w-6" icon={"mdi-plus"} />
              </IconButton>
            </Link>
          </>
        }
        title={t("Staking Pools")}
      />
    </Layout>
  );
};
export default StakingPools;
export const permission = "Access Staking Pool Management";

"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/ext/p2p/commission";
const columnConfig: ColumnConfigType[] = [
  {
    field: "tradeId",
    label: "Trade ID",
    type: "text",
    sortable: true,
  },
  {
    field: "amount",
    label: "Amount",
    type: "number",
    sortable: true,
  },
];
const P2pCommissions = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("P2P Commissions")}>
      <DataTable
        canCreate={false}
        canView={false}
        columnConfig={columnConfig}
        endpoint={api}
        hasAnalytics
        title={t("P2P Commissions")}
      />
    </Layout>
  );
};
export default P2pCommissions;
export const permission = "Access P2P Commission Management";

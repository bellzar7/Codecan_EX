"use client";
import { formatDate } from "date-fns";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/ext/p2p/payment/method";
const columnConfig: ColumnConfigType[] = [
  {
    field: "name",
    label: "Name",
    sublabel: "createdAt",
    type: "text",
    sortable: true,
    hasImage: true,
    imageKey: "image",
    placeholder: "/img/placeholder.svg",
    getSubValue: (row) => formatDate(new Date(row.createdAt), "dd MMM yyyy"),
  },
  {
    field: "walletType",
    label: "Type",
    type: "select",
    sortable: true,
    options: [
      { value: "FIAT", label: "Fiat", color: "info" },
      { value: "SPOT", label: "Spot", color: "success" },
      { value: "ECO", label: "Eco", color: "warning" },
    ],
  },
  {
    field: "currency",
    label: "Currency",
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
        canDelete={false}
        columnConfig={columnConfig}
        endpoint={api}
        hasAnalytics={false}
        isParanoid={false}
        title={t("P2P Payment Methods")}
      />
    </Layout>
  );
};
export default P2pPaymentMethods;

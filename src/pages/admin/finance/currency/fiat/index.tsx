"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/finance/currency/fiat";
const columnConfig: ColumnConfigType[] = [
  {
    field: "name",
    label: "Name",
    type: "text",
    sortable: true,
  },
  {
    field: "symbol",
    label: "Symbol",
    type: "text",
    sortable: true,
  },
  {
    field: "precision",
    label: "Precision",
    type: "number",
    sortable: true,
  },
  {
    field: "price",
    label: "Price",
    type: "number",
    sortable: true,
  },
  {
    field: "status",
    label: "Status",
    type: "switch",
    sortable: false,
    api: `${api}/:id/status`,
  },
];
const Currencies = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Currencies Management")}>
      <DataTable
        canCreate={false}
        canDelete={false}
        canView={false}
        columnConfig={columnConfig}
        endpoint={api}
        isParanoid={false}
        title={t("Currencies")}
      />
    </Layout>
  );
};
export default Currencies;
export const permission = "Access Fiat Currency Management";

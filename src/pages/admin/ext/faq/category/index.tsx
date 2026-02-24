"use client";
import { capitalize } from "lodash";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/ext/faq/category";
const columnConfig: ColumnConfigType[] = [
  {
    field: "id",
    label: "id",
    type: "text",
    sortable: true,
    getValue: (row) => capitalize(row.id),
  },
];
const FaqCategories = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("FAQ Categories")}>
      <DataTable
        columnConfig={columnConfig}
        endpoint={api}
        isCrud={false}
        title={t("FAQ Categories")}
      />
    </Layout>
  );
};
export default FaqCategories;
export const permission = "Access FAQ Category Management";

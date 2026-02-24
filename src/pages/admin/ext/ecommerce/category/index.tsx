"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/ext/ecommerce/category";
const columnConfig: ColumnConfigType[] = [
  {
    field: "name",
    label: "Name",
    type: "text",
    sortable: true,
    hasImage: true,
    imageKey: "image",
    placeholder: "/img/placeholder.svg",
  },
  {
    field: "description",
    label: "Description",
    type: "text",
    sortable: false,
  },
  {
    field: "status",
    label: "Status",
    type: "switch",
    sortable: false,
    api: `${api}/:id/status`,
  },
];
const EcommerceCategories = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Ecommerce Categories")}>
      <DataTable
        columnConfig={columnConfig}
        endpoint={api}
        title={t("Ecommerce Categories")}
        viewPath="/store/category/[id]"
      />
    </Layout>
  );
};
export default EcommerceCategories;
export const permission = "Access Ecommerce Category Management";

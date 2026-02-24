"use client";
import { formatDate } from "date-fns";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/content/category";
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
    getSubValue: (row) => formatDate(new Date(row?.createdAt), "yyyy-MM-dd"),
  },
  {
    field: "slug",
    label: "Slug",
    type: "text",
    sortable: true,
  },
  {
    field: "description",
    label: "Description",
    type: "text",
    sortable: false,
  },
  {
    field: "posts",
    label: "Posts",
    type: "number",
    sortable: true,
    filterable: false,
    getValue: (row) => row.posts?.length,
  },
];
const Categories = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Categories")}>
      <DataTable
        columnConfig={columnConfig}
        endpoint={api}
        title={t("Categories")}
        viewPath="/blog/category/[slug]"
      />
    </Layout>
  );
};
export default Categories;
export const permission = "Access Category Management";

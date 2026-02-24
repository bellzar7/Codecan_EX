"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const columnConfig = [
  {
    field: "title",
    label: "Title",
    type: "text",
    sortable: true,
  },
  {
    field: "content",
    label: "Content",
    type: "textarea",
    sortable: false,
  },
  {
    field: "description",
    label: "Description",
    type: "textarea",
    sortable: false,
  },
  {
    field: "image",
    label: "Image",
    type: "file",
    sortable: false,
    fileType: "image",
  },
  {
    field: "slug",
    label: "Slug",
    type: "text",
    sortable: true,
  },
  {
    field: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "PUBLISHED", label: "Published" },
      { value: "DRAFT", label: "Draft" },
    ],
    sortable: true,
  },
];
const Pages = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("CMS Pages Management")}>
      <DataTable
        canCreate
        canDelete
        canEdit
        columnConfig={columnConfig}
        endpoint="/api/admin/page"
        formSize="sm"
        hasStructure
        isCrud
        isParanoid={false}
        title={t("Pages")}
      />
    </Layout>
  );
};
export default Pages;
export const permission = "Access Pages Management";

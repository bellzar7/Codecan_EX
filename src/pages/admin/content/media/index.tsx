"use client";
import { formatDate } from "date-fns";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/content/media";
const columnConfig: ColumnConfigType[] = [
  {
    field: "path",
    label: "Image",
    type: "image",
    sortable: false,
  },
  {
    field: "name",
    label: "Name",
    sublabel: "name",
    type: "text",
    sortable: true,
    sortName: "path",
    getValue: (row) =>
      // remove first /
      row.path?.replace(`/${row.name}`, ""),
    getSubValue: (row) => row.name,
  },
  {
    field: "dateModified",
    label: "Created At",
    type: "datetime",
    sortable: true,
    filterable: false,
    getValue: (row) => formatDate(new Date(row.createdAt), "yyyy-MM-dd"),
  },
];
const Media = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Media")}>
      <DataTable
        blank={true}
        canCreate={false}
        canEdit={false}
        columnConfig={columnConfig}
        endpoint={api}
        hasStructure={false}
        isCrud={true}
        isParanoid={false}
        title={t("Media")}
        viewPath="[path]"
      />
    </Layout>
  );
};
export default Media;
export const permission = "Access Media Management";

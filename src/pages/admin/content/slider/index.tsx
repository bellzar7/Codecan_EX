"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/content/slider";

const columnConfig: ColumnConfigType[] = [
  {
    field: "image",
    label: "Slider Image",
    type: "image",
    sortable: true,
    placeholder: "/img/placeholder.svg",
  },
  {
    field: "link",
    label: "Link",
    type: "text",
    sortable: true,
    placeholder: "/img/placeholder.svg",
  },
  {
    field: "status",
    label: "Status",
    type: "switch",
    sortable: false,
    api: `${api}/:id/status`,
  },
];

const Sliders = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Sliders")}>
      <DataTable
        columnConfig={columnConfig}
        endpoint={api}
        title={t("Sliders")}
      />
    </Layout>
  );
};

export default Sliders;
export const permission = "Access Slider Management";

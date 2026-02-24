"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/crm/permission";
const columnConfig = [
  {
    field: "name",
    label: "Name",
    type: "text",
    sortable: true,
  },
];
const Permissions = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Permissions Management")}>
      <DataTable
        columnConfig={columnConfig}
        endpoint={api}
        isCrud={false}
        title={t("Permissions")}
      />
    </Layout>
  );
};
export default Permissions;
export const permission = "Access Permission Management";

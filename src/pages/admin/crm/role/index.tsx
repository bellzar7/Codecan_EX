"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/crm/role";
const columnConfig = [
  {
    field: "name",
    label: "Name",
    type: "text",
    sortable: true,
  },
  {
    field: "permissions",
    label: "Permissions",
    type: "tags",
    key: "name",
    sortable: false,
    filterable: false,
  },
];
const Roles = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Roles Management")}>
      <DataTable
        canView={false}
        columnConfig={columnConfig}
        endpoint={api}
        isParanoid={false}
        title={t("Roles")}
      />
    </Layout>
  );
};
export default Roles;
export const permission = "Access Role Management";

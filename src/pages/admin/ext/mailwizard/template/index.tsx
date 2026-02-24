"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/ext/mailwizard/template";
const columnConfig: ColumnConfigType[] = [
  {
    field: "name",
    label: "Template Name",
    type: "text",
    sortable: true,
  },
];
const MailwizardTemplates = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Mailwizard Templates")}>
      <DataTable
        canImport
        canView={false}
        columnConfig={columnConfig}
        editPath="/admin/ext/mailwizard/template/[id]"
        endpoint={api}
        title={t("Mailwizard Templates")}
      />
    </Layout>
  );
};
export default MailwizardTemplates;
export const permission = "Access Mailwizard Template Management";

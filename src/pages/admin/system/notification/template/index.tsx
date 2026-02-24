"use client";
import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const columnConfig: ColumnConfigType[] = [
  {
    field: "subject",
    label: "Subject",
    type: "text",
    sortable: true,
  },
  {
    field: "email",
    label: "Email",
    type: "select",
    sortable: false,
    options: [
      { value: true, label: "Yes", color: "success" },
      { value: false, label: "No", color: "danger" },
    ],
  },
  {
    field: "sms",
    label: "SMS",
    type: "select",
    sortable: false,
    options: [
      { value: true, label: "Yes", color: "success" },
      { value: false, label: "No", color: "danger" },
    ],
  },
  {
    field: "push",
    label: "Push",
    type: "select",
    sortable: false,
    options: [
      { value: true, label: "Yes", color: "success" },
      { value: false, label: "No", color: "danger" },
    ],
  },
];
const NotificationTemplates = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Notification Templates Management")}>
      <DataTable
        canCreate={false}
        canDelete={false}
        canView={false}
        columnConfig={columnConfig}
        editPath="/admin/system/notification/template/[id]"
        endpoint="/api/admin/system/notification/template"
        formSize="sm"
        isParanoid={false}
        title={t("Notification Templates")}
      />
    </Layout>
  );
};
export default NotificationTemplates;
export const permission = "Access Notification Template Management";

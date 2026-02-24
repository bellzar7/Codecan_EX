import { useTranslation } from "next-i18next";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/user/support/ticket";
const columnConfig: ColumnConfigType[] = [
  {
    field: "subject",
    label: "Subject",
    type: "text",
    sortable: true,
  },
  {
    field: "importance",
    label: "Importance",
    type: "select",
    options: [
      {
        value: "LOW",
        label: "Low",
        color: "muted",
      },
      {
        value: "MEDIUM",
        label: "Medium",
        color: "warning",
      },
      {
        value: "HIGH",
        label: "High",
        color: "danger",
      },
    ],
    sortable: true,
  },
  {
    field: "type",
    label: "Type",
    type: "select",
    options: [
      {
        value: "LIVE",
        label: "Live Chat",
        color: "success",
      },
      {
        value: "TICKET",
        label: "Ticket",
        color: "info",
      },
    ],
    sortable: true,
  },
  {
    field: "status",
    label: "Status",
    type: "select",
    options: [
      {
        value: "PENDING",
        label: "Pending",
        color: "warning",
      },
      {
        value: "OPEN",
        label: "Open",
        color: "info",
      },
      {
        value: "REPLIED",
        label: "Replied",
        color: "primary",
      },
      {
        value: "CLOSED",
        label: "Closed",
        color: "success",
      },
    ],
    sortable: true,
  },
];
const SupportTickets = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Support Tickets")}>
      <DataTable
        canCreate={true}
        canDelete={false}
        canEdit={false}
        columnConfig={columnConfig}
        endpoint={api}
        hasStructure={true}
        isParanoid={false}
        title={t("Support Tickets")}
        viewPath="/user/support/ticket/[id]"
      />
    </Layout>
  );
};
export default SupportTickets;

import { useTranslation } from "next-i18next";
import { useState } from "react";
import { DataTable } from "@/components/elements/base/datatable";
import { SystemStatus } from "@/components/pages/admin/dashboard/SystemStatus";
import Layout from "@/layouts/Default";

const columnConfig: ColumnConfigType[] = [
  {
    field: "title",
    label: "Title",
    sublabel: "createdAt",
    type: "text",
    sortable: true,
  },
  {
    field: "message",
    label: "Message",
    sublabel: "link",
    type: "text",
    sortable: false,
  },
  {
    field: "type",
    label: "Type",
    type: "select",
    sortable: true,
    options: [
      { value: "SECURITY", label: "Security", color: "danger" },
      { value: "SYSTEM", label: "System", color: "warning" },
      { value: "ACTIVITY", label: "Activity", color: "info" },
    ],
  },
];

const TabButton = ({ label, activeTab, setActiveTab, tabKey }) => {
  const { t } = useTranslation();
  const isActive = activeTab === tabKey;
  return (
    <button
      aria-label={t(label)}
      className={`shrink-0 border-b-2 px-6 pb-4 text-sm transition-colors duration-300 ${
        isActive
          ? "border-primary-500 text-primary-500 dark:border-primary-400 dark:text-primary-400"
          : "border-transparent text-muted"
      }
                `}
      onClick={() => setActiveTab(tabKey)}
      type="button"
    >
      <span>{t(label)}</span>
    </button>
  );
};

const NotificationsTab = () => {
  const { t } = useTranslation();
  return (
    <div className="mt-8">
      <DataTable
        canCreate={false}
        canDelete
        canEdit={false}
        canView={false}
        columnConfig={columnConfig}
        endpoint="/api/user/notification"
        formSize="sm"
        hasStructure={false}
        hasTitle={false}
        isParanoid={false}
        title={t("Notifications")}
      />
    </div>
  );
};

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("Notifications");

  return (
    <Layout color="muted" title={t("Feed")}>
      <div className="flex w-full gap-4 overflow-x-auto border-muted-200 border-b md:w-auto dark:border-muted-800">
        <TabButton
          activeTab={activeTab}
          label="System Status"
          setActiveTab={setActiveTab}
          tabKey="SystemStatus"
        />
        <TabButton
          activeTab={activeTab}
          label="Notifications"
          setActiveTab={setActiveTab}
          tabKey="Notifications"
        />
      </div>
      {activeTab === "SystemStatus" && <SystemStatus />}
      {activeTab === "Notifications" && <NotificationsTab />}
    </Layout>
  );
};

export default AdminDashboard;
export const permission = "Access Admin Dashboard";

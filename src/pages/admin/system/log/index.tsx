"use client";
import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import Button from "@/components/elements/base/button/Button";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";
import { useDataTable } from "@/stores/datatable";
import $fetch from "@/utils/api";

const api = "/api/admin/system/log";
const columnConfig: ColumnConfigType[] = [
  // category
  {
    field: "category",
    label: "Category",
    sublabel: "file",
    type: "text",
    sortable: true,
  },
  // timestamp
  {
    field: "timestamp",
    label: "Timestamp",
    type: "datetime",
    sortable: true,
    filterable: false,
  },
  {
    field: "level",
    label: "Level",
    type: "select",
    sortable: true,
    options: [
      {
        label: "Error",
        value: "error",
        color: "danger",
      },
      {
        label: "Warn",
        value: "warn",
        color: "warning",
      },
      {
        label: "Info",
        value: "info",
        color: "info",
      },
      {
        label: "Debug",
        value: "debug",
      },
    ],
  },
  // message
  {
    field: "message",
    label: "Message",
    type: "text",
    sortable: true,
  },
];
const Log = () => {
  const { t } = useTranslation();
  const { fetchData } = useDataTable();

  const cleanLogs = async () => {
    const { data, error } = await $fetch({
      url: "/api/admin/system/log/clean",
      method: "DELETE",
    });

    if (!error) {
      fetchData();
    }
  };
  return (
    <Layout color="muted" title={t("Log Monitor")}>
      <DataTable
        canCreate={false}
        canEdit={false}
        canView={false}
        columnConfig={columnConfig}
        endpoint={api}
        hasStructure={false}
        isParanoid={false}
        navSlot={
          <>
            <Button color="danger" onClick={cleanLogs} shape={"rounded-sm"}>
              <Icon icon="mdi:delete" />
              {t("Clean Logs")}
            </Button>
          </>
        }
        title={t("Log")}
      />
    </Layout>
  );
};
export default Log;
export const permission = "Access Log Monitor";

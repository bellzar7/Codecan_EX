"use client";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import React from "react";
import Button from "@/components/elements/base/button/Button";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";
import { useDataTable } from "@/stores/datatable";
import $fetch from "@/utils/api";

const api = "/api/admin/finance/exchange/market";
const columnConfig: ColumnConfigType[] = [
  {
    field: "currency",
    label: "Currency",
    type: "text",
    sortable: true,
    getValue: (item) => item.currency?.toUpperCase(),
    sortName: "currency",
  },
  {
    field: "pair",
    label: "Pair",
    type: "text",
    sortable: true,
    getValue: (item) => item.pair?.toUpperCase(),
    sortName: "pair",
  },
  {
    field: "isTrending",
    label: "Trending",
    type: "select",
    sortable: true,
    options: [
      { value: true, label: "Yes", color: "success" },
      { value: false, label: "No", color: "danger" },
    ],
  },
  {
    field: "isHot",
    label: "Hot",
    type: "select",
    sortable: true,
    options: [
      { value: true, label: "Yes", color: "success" },
      { value: false, label: "No", color: "danger" },
    ],
  },
  {
    field: "status",
    label: "Status",
    type: "switch",
    sortable: true,
    api: `${api}/:id/status`,
  },
];
const Markets = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { fetchData } = useDataTable();
  const [loading, setLoading] = React.useState(false);
  const importMarket = async () => {
    setLoading(true);
    const { error } = await $fetch({
      url: `${api}/import`,
    });
    if (!error) {
      fetchData();
    }
    setLoading(false);
  };
  return (
    <Layout color="muted" title={t("Exchange Markets")}>
      <DataTable
        canCreate={false}
        columnConfig={columnConfig}
        endpoint={api}
        navSlot={
          <>
            <Button
              color="primary"
              disabled={loading}
              loading={loading}
              onClick={importMarket}
              type="button"
            >
              <Icon className={`"h-6 w-6`} icon="mdi:plus" />
              <span>{t("Import")}</span>
            </Button>
            <Button
              color="muted"
              onClick={() => {
                router.back();
              }}
              type="button"
            >
              <Icon className={`"h-4 mr-2 w-4`} icon="line-md:chevron-left" />
              <span>{t("Back")}</span>
            </Button>
          </>
        }
        title={t("Markets")}
      />
    </Layout>
  );
};
export default Markets;
export const permission = "Access Exchange Market Management";

"use client";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import IconBox from "@/components/elements/base/iconbox/IconBox";
import { ObjectTable } from "@/components/elements/base/object-table";
import Layout from "@/layouts/Default";
import $fetch from "@/utils/api";

const api = "/api/admin/system/cron";
const columnConfig: ColumnConfigType[] = [
  {
    field: "title",
    label: "Title",
    type: "text",
    sortable: true,
  },
  {
    field: "description",
    label: "Description",
    type: "text",
    sortable: true,
  },
  {
    field: "period",
    label: "Every",
    type: "text",
    sortable: true,
    getValue: (item) => {
      return item.period ? `${item.period / 60_000} minutes` : "Never";
    },
  },
  {
    field: "lastRun",
    label: "Last Run",
    type: "text",
    sortable: true,
    getValue: (item) => {
      return item.lastRun ? new Date(item.lastRun).toLocaleString() : "Never";
    },
  },
];
const Log = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<Record<string, any>[]>([]);
  const fetchCron = async () => {
    const { data, error } = await $fetch({
      url: api,
      silent: true,
    });
    if (!error) {
      setItems(data as any);
    }
  };
  const router = useRouter();
  useEffect(() => {
    if (router.isReady) {
      fetchCron();
    }
  }, [router.isReady]);
  const runCron = async () => {
    const { error } = await $fetch({
      url: "/api/cron",
    });
    if (!error) {
      fetchCron();
    }
  };
  return (
    <Layout color="muted" title={t("Cron Jobs Monitor")}>
      <ObjectTable
        columnConfig={columnConfig}
        filterField="title"
        initialPerPage={20}
        items={items}
        navSlot={
          <IconBox
            className="cursor-pointer transition-all duration-300 ease-in-out hover:bg-primary-500 hover:text-muted-100 hover:shadow-muted-300/30 hover:shadow-sm dark:hover:shadow-muted-800/20"
            color="primary"
            icon="lucide:play"
            onClick={() => runCron()}
            shape={"rounded-sm"}
            size={"sm"}
            variant={"pastel"}
          />
        }
        setItems={setItems}
        shape="rounded-sm"
        size="sm"
        title={t("Cron Jobs")}
      />
    </Layout>
  );
};
export default Log;
export const permission = "Access Cron Job Management";

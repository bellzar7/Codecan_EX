import { debounce } from "lodash";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import type React from "react";
import { useEffect, useState } from "react";
import IconBox from "@/components/elements/base/iconbox/IconBox";
import { ObjectTable } from "@/components/elements/base/object-table";
import Layout from "@/layouts/Default";
import $fetch from "@/utils/api";

const api = "/api/admin/finance/exchange/balance";
interface Balance {
  asset: string;
  available: number;
  inOrder: number;
  total: number;
}
const columnConfig: ColumnConfigType[] = [
  {
    field: "asset",
    label: "Asset",
    type: "string",
    sortable: true,
  },
  {
    field: "available",
    label: "Available Balance",
    type: "number",
    precision: 8,
    sortable: true,
  },
  {
    field: "inOrder",
    label: "In Order Balance",
    type: "number",
    precision: 8,
    sortable: true,
  },
  {
    field: "total",
    label: "Total Balance",
    type: "number",
    precision: 8,
    sortable: true,
  },
];
const ExchangeBalanceDashboard: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [balances, setBalances] = useState<Balance[]>([]);
  const fetchExchangeBalance = async () => {
    const { data, error } = await $fetch({
      url: api,
      silent: true,
    });
    if (!error) {
      // biome-ignore lint/suspicious/noExplicitAny: API response structure is dynamic
      setBalances((data as any).balance);
    }
  };
  const debounceFetchExchangeBalance = debounce(fetchExchangeBalance, 100);
  useEffect(() => {
    if (router.isReady) {
      debounceFetchExchangeBalance();
    }
  }, [router.isReady, debounceFetchExchangeBalance]);
  return (
    <Layout color="muted" title={t("Exchange Balance")}>
      <ObjectTable
        columnConfig={columnConfig}
        filterField="asset"
        initialPerPage={20}
        items={balances}
        navSlot={
          <IconBox
            className="cursor-pointer transition-all duration-300 ease-in-out hover:bg-primary-500 hover:text-muted-100 hover:shadow-muted-300/30 hover:shadow-sm dark:hover:shadow-muted-800/20"
            color="primary"
            icon="mdi:refresh"
            onClick={() => fetchExchangeBalance()}
            shape={"rounded-sm"}
            size={"sm"}
            variant={"pastel"}
          />
        }
        setItems={setBalances}
        shape="rounded-sm"
        size="sm"
        title={t("Exchange Balance")}
      />
    </Layout>
  );
};
export default ExchangeBalanceDashboard;
export const permission = "Access Exchange Balance Management";

import { debounce } from "lodash";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import type React from "react";
import { useEffect, useState } from "react";
import IconBox from "@/components/elements/base/iconbox/IconBox";
import { ObjectTable } from "@/components/elements/base/object-table";
import { Tooltip } from "@/components/elements/base/tooltips/Tooltip";
import Layout from "@/layouts/Default";
import $fetch from "@/utils/api";

const api = "/api/admin/finance/exchange/fee";
interface FeeComparison {
  currency: string;
  totalAmount: number;
  totalCalculatedFee: number;
  totalExchangeFee: number;
  totalExtraFee: number;
}
const columnConfig: ColumnConfigType[] = [
  {
    field: "currency",
    label: "Fee Currency",
    type: "string",
    sortable: true,
  },
  {
    field: "totalAmount",
    label: "Total Amount",
    type: "number",
    precision: 8,
    sortable: true,
  },
  {
    field: "totalCalculatedFee",
    label: "Calculated Fee",
    type: "number",
    precision: 8,
    sortable: true,
  },
  {
    field: "totalExchangeFee",
    label: "Exchange Fee",
    type: "number",
    precision: 8,
    sortable: true,
  },
  {
    field: "totalExtraFee",
    label: "Collectable Fee",
    type: "number",
    precision: 8,
    sortable: true,
  },
];
const ExchangeOrderFeesDashboard: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [fees, setFees] = useState<FeeComparison[]>([]);
  const fetchOrderFees = async () => {
    const { data, error } = await $fetch({
      url: api,
      silent: true,
    });
    if (!error) {
      // biome-ignore lint/suspicious/noExplicitAny: API response structure is dynamic
      setFees((data as any).feesComparison);
    }
  };
  const debounceFetchOrderFees = debounce(fetchOrderFees, 100);
  useEffect(() => {
    if (router.isReady) {
      debounceFetchOrderFees();
    }
  }, [router.isReady, debounceFetchOrderFees]);
  return (
    <Layout color="muted" title={t("Collectable Fee")}>
      <ObjectTable
        columnConfig={columnConfig}
        filterField="currency"
        initialPerPage={20}
        items={fees}
        navSlot={
          <Tooltip content={t("Refresh")}>
            <IconBox
              className="cursor-pointer transition-all duration-300 ease-in-out hover:bg-primary-500 hover:text-muted-100 hover:shadow-muted-300/30 hover:shadow-sm dark:hover:shadow-muted-800/20"
              color="primary"
              icon="mdi:refresh"
              onClick={() => fetchOrderFees()}
              shape={"rounded-sm"}
              size={"sm"}
              variant={"pastel"}
            />
          </Tooltip>
        }
        setItems={setFees}
        shape="rounded-sm"
        size="sm"
        title={t("Collectable Fee")}
      />
    </Layout>
  );
};
export default ExchangeOrderFeesDashboard;
export const permission = "Access Exchange Fee Management";

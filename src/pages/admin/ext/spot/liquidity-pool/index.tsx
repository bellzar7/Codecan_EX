"use client";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import { DataTable } from "@/components/elements/base/datatable";
import Layout from "@/layouts/Default";

const api = "/api/admin/ext/spot/liquidity-pool";
const columnConfig: ColumnConfigType[] = [
  {
    field: "currency",
    label: "Trading Pair",
    sublabel: "pair",
    type: "text",
    sortable: true,
    getValue: (row) => `${row.currency}/${row.pair}`,
  },
  {
    field: "baseBalance",
    label: "Base Balance",
    sublabel: "baseInOrder",
    type: "number",
    sortable: true,
    getValue: (row) => `${row.baseBalance} ${row.currency}`,
    getSubValue: (row) => `In Order: ${row.baseInOrder}`,
  },
  {
    field: "quoteBalance",
    label: "Quote Balance",
    sublabel: "quoteInOrder",
    type: "number",
    sortable: true,
    getValue: (row) => `${row.quoteBalance} ${row.pair}`,
    getSubValue: (row) => `In Order: ${row.quoteInOrder}`,
  },
  {
    field: "priceSource",
    label: "Price Source",
    type: "select",
    sortable: true,
    options: [
      { value: "BINANCE", label: "Binance", color: "primary" },
      { value: "TWD", label: "TWD Provider", color: "info" },
      { value: "ADMIN", label: "Admin Price", color: "warning" },
      { value: "ORDERBOOK", label: "Order Book", color: "muted" },
    ],
  },
  {
    field: "spreadPercentage",
    label: "Spread %",
    type: "number",
    sortable: true,
    getValue: (row) => `${row.spreadPercentage}%`,
  },
  {
    field: "status",
    label: "Status",
    type: "switch",
    sortable: true,
    api: `${api}/:id/status`,
  },
];

const LiquidityPools = () => {
  const { t } = useTranslation();
  return (
    <Layout color="muted" title={t("Liquidity Pools")}>
      <DataTable
        canCreate={false}
        columnConfig={columnConfig}
        editPath="/admin/ext/spot/liquidity-pool/[id]"
        endpoint={api}
        hasAnalytics
        navSlot={
          <Link color="success" href="/admin/ext/spot/liquidity-pool/create">
            <IconButton
              aria-label="Create Liquidity Pool"
              color="success"
              size="lg"
              variant="pastel"
            >
              <Icon className="h-6 w-6" icon="mdi-plus" />
            </IconButton>
          </Link>
        }
        title={t("Liquidity Pools")}
      />
    </Layout>
  );
};

export default LiquidityPools;
export const permission = "Access Liquidity Pool Management";

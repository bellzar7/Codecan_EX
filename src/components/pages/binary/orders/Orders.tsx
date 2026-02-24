import { format as formatDate } from "date-fns";
import { debounce } from "lodash";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { memo, useEffect } from "react";
import { shallow } from "zustand/shallow";
import { ObjectTable } from "@/components/elements/base/object-table";
import { Tab } from "@/components/elements/base/tab";
import { useBinaryOrderStore } from "@/stores/binary/order";
import useMarketStore from "@/stores/trade/market";
import { DynamicClosePriceCell } from "./cells/ClosePriceCell";
import { DynamicProfitCell } from "./cells/ProfitCell";
import { OrderDetails } from "./OrderDetails";

const statusClass = (status: string) => {
  switch (status) {
    case "WIN":
      return "text-success-500";
    case "LOSS":
      return "text-danger-500";
    case "DRAW":
      return "text-muted-500";
    default:
      return "text-muted-500";
  }
};

const OrdersBase = () => {
  const { t } = useTranslation();
  const tabs = [
    { value: "OPEN", label: "Open Orders" },
    { value: "HISTORY", label: "Order History" },
  ];
  const market = useMarketStore((state) => state.market, shallow);
  const getPrecision = (type: string) => Number(market?.precision?.[type] || 8);
  const {
    ordersTab,
    setOrdersTab,
    orders,
    openOrders,
    fetchOrders,
    setOrders,
    setOpenOrders,
  } = useBinaryOrderStore();
  const router = useRouter();
  const columnConfig: ColumnConfigType[] = [
    {
      field: "createdAt",
      label: "Date",
      type: "date",
      sortable: true,
      filterable: false,
      getValue: (row) =>
        formatDate(new Date(row.createdAt), "yyyy-MM-dd HH:mm"),
    },
    {
      field: "type",
      label: "Type",
      type: "text",
      sortable: true,
    },
    {
      field: "side",
      label: "Side",
      type: "text",
      sortable: true,
      getValue: (row) => (
        <span
          className={
            row.side === "RISE" ? "text-success-500" : "text-danger-500"
          }
        >
          {row.side}
        </span>
      ),
    },
    {
      field: "price",
      label: "Price",
      type: "number",
      sortable: true,
      getValue: (row) => row.price?.toFixed(getPrecision("price")),
    },
    {
      field: "closePrice",
      label: "Close Price",
      type: "number",
      sortable: true,
      renderCell: (row) => (
        <DynamicClosePriceCell
          getPrecision={getPrecision}
          order={row}
          statusClass={statusClass}
          t={t}
        />
      ),
    },
    {
      field: "amount",
      label: "Amount",
      type: "number",
      sortable: true,
      getValue: (row) => row.amount?.toFixed(getPrecision("amount")),
    },
    {
      field: "profit",
      label: "Profit",
      type: "number",
      sortable: true,
      renderCell: (row) => (
        <DynamicProfitCell getPrecision={getPrecision} order={row} />
      ),
    },
  ];
  const openColumnConfig: ColumnConfigType[] = [
    ...columnConfig,
    // Uncomment if you want actions
    // {
    //   field: "actions",
    //   label: "",
    //   type: "actions",
    //   sortable: false,
    //   actions: [
    //     {
    //       icon: "mdi:cancel",
    //       color: "danger",
    //       onClick: async (row) => {
    //         await cancelOrder(row.id, market.currency, market.pair);
    //       },
    //       size: "sm",
    //       loading,
    //       disabled: loading,
    //       tooltip: "Cancel Order",
    //     },
    //   ],
    // },
  ];

  const debouncedFetchOrders = debounce(fetchOrders, 100);
  useEffect(() => {
    if (
      market &&
      router.isReady &&
      ordersTab &&
      ["OPEN", "HISTORY"].includes(ordersTab)
    ) {
      debouncedFetchOrders(market.currency, market.pair);
    }
  }, [router.isReady, market, ordersTab]);

  const renderExpandedContent = (item: any) => {
    return <OrderDetails order={item} />;
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex gap-2 border-muted-200 border-b md:overflow-x-auto dark:border-muted-800">
        {tabs.map((tab) => (
          <Tab
            color="warning"
            key={tab.value}
            label={tab.label}
            setTab={setOrdersTab}
            tab={ordersTab}
            value={tab.value}
          />
        ))}
      </div>
      {ordersTab === "OPEN" && market?.currency && market?.pair && (
        <ObjectTable
          border={false}
          columnConfig={openColumnConfig}
          expandable={true}
          expansionMode="modal"
          items={openOrders}
          renderExpandedContent={renderExpandedContent}
          setItems={setOpenOrders} // Enable expandable rows
          shape="straight"
          size="xs"
        />
      )}
      {ordersTab === "HISTORY" && (
        <ObjectTable
          border={false}
          columnConfig={columnConfig}
          expandable={true}
          expansionMode="modal"
          items={orders}
          renderExpandedContent={renderExpandedContent}
          setItems={setOrders} // Enable expandable rows
          shape="straight"
          size="xs"
        />
      )}
    </div>
  );
};
export const Orders = memo(OrdersBase);

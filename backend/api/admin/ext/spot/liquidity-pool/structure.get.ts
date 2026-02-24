import { structureSchema } from "@b/utils/constants";

export const metadata = {
  summary: "Get form structure for liquidity pools",
  operationId: "getLiquidityPoolStructure",
  tags: ["Admin", "Spot", "Liquidity Pools"],
  responses: {
    200: {
      description: "Form structure for liquidity pools",
      content: structureSchema,
    },
  },
  permission: "Access Liquidity Pool Management",
};

export const liquidityPoolStructure = () => {
  const currency = {
    type: "input",
    label: "Base Currency",
    name: "currency",
    placeholder: "Enter base currency (e.g., BTC)",
    ts: "string",
  };

  const pair = {
    type: "input",
    label: "Quote Currency",
    name: "pair",
    placeholder: "Enter quote currency (e.g., USDT)",
    ts: "string",
  };

  const baseBalance = {
    type: "input",
    label: "Base Balance",
    name: "baseBalance",
    placeholder: "Enter base currency balance",
    ts: "number",
  };

  const quoteBalance = {
    type: "input",
    label: "Quote Balance",
    name: "quoteBalance",
    placeholder: "Enter quote currency balance",
    ts: "number",
  };

  const adminPrice = {
    type: "input",
    label: "Admin Price",
    name: "adminPrice",
    placeholder: "Enter admin-set price (optional)",
    ts: "number",
  };

  const priceSource = {
    type: "select",
    label: "Price Source",
    name: "priceSource",
    options: [
      { value: "BINANCE", label: "Binance" },
      { value: "TWD", label: "TWD Provider" },
      { value: "ADMIN", label: "Admin Price" },
      { value: "ORDERBOOK", label: "Order Book" },
    ],
    ts: "string",
  };

  const minOrderSize = {
    type: "input",
    label: "Min Order Size",
    name: "minOrderSize",
    placeholder: "Enter minimum order size",
    ts: "number",
  };

  const maxOrderSize = {
    type: "input",
    label: "Max Order Size",
    name: "maxOrderSize",
    placeholder: "Enter maximum order size (0 = unlimited)",
    ts: "number",
  };

  const spreadPercentage = {
    type: "input",
    label: "Spread Percentage",
    name: "spreadPercentage",
    placeholder: "Enter spread percentage",
    ts: "number",
  };

  const status = {
    type: "select",
    label: "Status",
    name: "status",
    options: [
      { value: true, label: "Active" },
      { value: false, label: "Inactive" },
    ],
    ts: "boolean",
  };

  return {
    currency,
    pair,
    baseBalance,
    quoteBalance,
    adminPrice,
    priceSource,
    minOrderSize,
    maxOrderSize,
    spreadPercentage,
    status,
  };
};

export default (): object => {
  const {
    currency,
    pair,
    baseBalance,
    quoteBalance,
    adminPrice,
    priceSource,
    minOrderSize,
    maxOrderSize,
    spreadPercentage,
    status,
  } = liquidityPoolStructure();

  return {
    get: [
      currency,
      pair,
      baseBalance,
      quoteBalance,
      adminPrice,
      priceSource,
      minOrderSize,
      maxOrderSize,
      spreadPercentage,
      status,
    ],
    set: [
      [currency, pair],
      [baseBalance, quoteBalance],
      [adminPrice, priceSource],
      [minOrderSize, maxOrderSize],
      [spreadPercentage, status],
    ],
  };
};

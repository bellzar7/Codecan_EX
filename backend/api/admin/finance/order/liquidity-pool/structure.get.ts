import { structureSchema } from "@b/utils/constants";

export const metadata = {
  summary: "Get form structure for liquidity pools",
  operationId: "getLiquidityPoolStructure",
  tags: ["Admin", "Liquidity Pool"],
  responses: {
    200: {
      description: "Form structure for liquidity pools",
      content: structureSchema,
    },
  },
  permission: "Access Liquidity Pool Management",
};

export const poolStructure = () => {
  const symbol = {
    type: "input",
    label: "Symbol",
    name: "symbol",
    placeholder: "BTC/USDT",
    required: true,
  };

  const currency = {
    type: "input",
    label: "Base Currency",
    name: "currency",
    placeholder: "BTC",
    required: true,
  };

  const pair = {
    type: "input",
    label: "Quote Currency",
    name: "pair",
    placeholder: "USDT",
    required: true,
  };

  const baseBalance = {
    type: "input",
    label: "Base Balance",
    name: "baseBalance",
    placeholder: "0.00",
    ts: "number",
  };

  const quoteBalance = {
    type: "input",
    label: "Quote Balance",
    name: "quoteBalance",
    placeholder: "0.00",
    ts: "number",
  };

  const spreadPercentage = {
    type: "input",
    label: "Spread Percentage",
    name: "spreadPercentage",
    placeholder: "0.1",
    ts: "number",
  };

  const minOrderSize = {
    type: "input",
    label: "Min Order Size",
    name: "minOrderSize",
    placeholder: "0.00",
    ts: "number",
    step: 0.000_000_01,
    min: 0.000_000_01,
  };

  const maxOrderSize = {
    type: "input",
    label: "Max Order Size",
    name: "maxOrderSize",
    placeholder: "0.00",
    ts: "number",
    step: 0.000_000_01,
    min: 0,
  };

  const isActive = {
    type: "switch",
    label: "Active",
    name: "isActive",
    ts: "boolean",
  };

  return {
    symbol,
    currency,
    pair,
    baseBalance,
    quoteBalance,
    spreadPercentage,
    minOrderSize,
    maxOrderSize,
    isActive,
  };
};

export default (): object => {
  const {
    symbol,
    currency,
    pair,
    baseBalance,
    quoteBalance,
    spreadPercentage,
    minOrderSize,
    maxOrderSize,
    isActive,
  } = poolStructure();

  return {
    get: [
      symbol,
      [currency, pair],
      [baseBalance, quoteBalance],
      [spreadPercentage],
      [minOrderSize, maxOrderSize],
      isActive,
    ],
    set: [
      symbol,
      [currency, pair],
      [baseBalance, quoteBalance],
      [spreadPercentage],
      [minOrderSize, maxOrderSize],
      isActive,
    ],
  };
};

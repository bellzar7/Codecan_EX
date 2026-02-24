// /server/api/currencies/index.get.ts

import { models } from "@b/db";
import { createError } from "@b/utils/error";

import {
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { Op } from "sequelize";
import { baseCurrencySchema, baseResponseSchema } from "./utils";

export const metadata: OperationObject = {
  summary: "Lists all currencies with their current rates",
  description:
    "This endpoint retrieves all available currencies along with their current rates.",
  operationId: "getCurrencies",
  tags: ["Finance", "Currency"],
  parameters: [
    {
      name: "action",
      in: "query",
      description: "The action to perform",
      required: false,
      schema: {
        type: "string",
      },
    },
    {
      name: "walletType",
      in: "query",
      description: "The type of wallet to retrieve currencies for",
      required: true,
      schema: {
        type: "string",
      },
    },
    {
      name: "targetWalletType",
      in: "query",
      description: "The type of wallet to transfer to",
      required: false,
      schema: {
        type: "string",
      },
    },
  ],
  requiresAuth: true,
  responses: {
    200: {
      description: "Currencies retrieved successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              ...baseResponseSchema,
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: baseCurrencySchema,
                },
              },
            },
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("Currency"),
    500: serverErrorResponse,
  },
};

const walletTypeToModel = {
  FIAT: async (where) => models.currency.findAll({ where }),
  SPOT: async (where) => models.exchangeCurrency.findAll({ where }),
  ECO: async (where) => models.ecosystemToken.findAll({ where }),
};

export default async (data: Handler) => {
  const { user, query } = data;
  if (!user?.id) {
    throw createError(401, "Unauthorized");
  }

  const { action, walletType, targetWalletType } = query;
  const where = { status: true };

  switch (action) {
    case "deposit":
      return handleDeposit(walletType, where);
    case "withdraw":
    case "payment":
      return handleWithdraw(walletType, user.id);
    case "transfer":
      return handleTransfer(walletType, targetWalletType, user.id);
    default:
      throw createError(400, "Invalid action");
  }
};

async function handleDeposit(walletType, where) {
  const getModel = walletTypeToModel[walletType];
  if (!getModel) {
    throw createError(400, "Invalid wallet type");
  }

  let currencies = await getModel(where);

  switch (walletType) {
    case "FIAT":
      return currencies
        .map((currency) => ({
          value: currency.id,
          label: `${currency.id} - ${currency.name}`,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    case "SPOT":
      return currencies
        .map((currency) => ({
          value: currency.currency,
          label: `${currency.currency} - ${currency.name}`,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    case "ECO": {
      const seen = new Set();
      currencies = currencies.filter((currency) => {
        const duplicate = seen.has(currency.currency);
        seen.add(currency.currency);
        return !duplicate;
      });
      return currencies
        .map((currency) => ({
          value: currency.currency,
          label: `${currency.currency} - ${currency.name}`,
          icon: currency.icon,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
    default:
      throw createError(400, "Invalid wallet type");
  }
}

async function handleWithdraw(walletType, userId) {
  const wallets = await models.wallet.findAll({
    where: { userId, type: walletType, balance: { [Op.gt]: 0 } },
  });

  if (!wallets.length) {
    throw createError(404, `No ${walletType} wallets found to withdraw from`);
  }

  const currencies = wallets
    .map((wallet) => ({
      value: wallet.currency,
      label: `${wallet.currency} - ${wallet.balance}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return currencies;
}

/**
 * Get unique currencies used in TWD markets by market type.
 * Extracts currencies from both the symbol (base currency) and currency field (quote currency).
 *
 * For example, FOREX market "EUR/USD" with currency="USD" yields: ["EUR", "USD"]
 *
 * @param marketType - The market type: "forex", "stocks", or "indices"
 * @returns Array of unique currency codes used in markets of this type
 */
async function getTwdMarketCurrencies(
  marketType: "forex" | "stocks" | "indices"
): Promise<string[]> {
  const markets = await models.twdMarket.findAll({
    where: { type: marketType, status: true },
    attributes: ["symbol", "currency"],
  });

  const currencySet = new Set<string>();

  for (const market of markets) {
    // Add quote currency from currency field
    if (market.currency) {
      currencySet.add(market.currency.toUpperCase());
    }

    // Extract base currency from symbol if it's a pair (contains "/")
    if (market.symbol?.includes("/")) {
      const [baseCurrency] = market.symbol.split("/");
      if (baseCurrency) {
        currencySet.add(baseCurrency.toUpperCase());
      }
    }
  }

  return Array.from(currencySet).sort();
}

async function handleTransfer(walletType, targetWalletType, userId) {
  // Validate wallet types (all 7 supported types)
  const validWalletTypes = [
    "FIAT",
    "SPOT",
    "ECO",
    "FUTURES",
    "FOREX",
    "STOCK",
    "INDEX",
  ];

  if (!validWalletTypes.includes(walletType)) {
    throw createError(
      400,
      `Invalid source wallet type: ${walletType}. Must be one of: ${validWalletTypes.join(", ")}`
    );
  }

  if (!validWalletTypes.includes(targetWalletType)) {
    throw createError(
      400,
      `Invalid target wallet type: ${targetWalletType}. Must be one of: ${validWalletTypes.join(", ")}`
    );
  }

  // Explicitly reject deprecated TWD_PAPER type
  if (walletType === "TWD_PAPER" || targetWalletType === "TWD_PAPER") {
    throw createError(
      400,
      "TWD_PAPER is a deprecated wallet type. Please use SPOT, FOREX, STOCK, or INDEX instead."
    );
  }

  const fromWallets = await models.wallet.findAll({
    where: { userId, type: walletType, balance: { [Op.gt]: 0 } },
  });

  if (!fromWallets.length) {
    throw createError(404, `No ${walletType} wallets found to transfer from`);
  }

  const currencies = fromWallets
    .map((wallet) => ({
      value: wallet.currency,
      label: `${wallet.currency} - ${wallet.balance}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  let targetCurrencies: any[] = [];
  switch (targetWalletType) {
    case "FIAT": {
      // FIAT wallets use fiat currencies from currency table
      const fiatCurrencies = await models.currency.findAll({
        where: { status: true },
      });
      targetCurrencies = fiatCurrencies
        .map((currency) => ({
          value: currency.id,
          label: `${currency.id} - ${currency.name}`,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
      break;
    }
    case "SPOT": {
      // SPOT wallets use exchange currencies (cryptocurrencies and stablecoins)
      const spotCurrencies = await models.exchangeCurrency.findAll({
        where: { status: true },
      });

      targetCurrencies = spotCurrencies
        .map((currency) => ({
          value: currency.currency,
          label: `${currency.currency} - ${currency.name}`,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
      break;
    }
    case "FOREX": {
      // FOREX wallets - derive currencies from actual FOREX markets in twdMarket table
      const forexCurrencies = await getTwdMarketCurrencies("forex");
      targetCurrencies = forexCurrencies.map((currency) => ({
        value: currency,
        label: currency,
      }));
      break;
    }
    case "STOCK": {
      // STOCK wallets - derive currencies from actual STOCK markets in twdMarket table
      const stockCurrencies = await getTwdMarketCurrencies("stocks");
      targetCurrencies = stockCurrencies.map((currency) => ({
        value: currency,
        label: currency,
      }));
      break;
    }
    case "INDEX": {
      // INDEX wallets - derive currencies from actual INDEX markets in twdMarket table
      const indexCurrencies = await getTwdMarketCurrencies("indices");
      targetCurrencies = indexCurrencies.map((currency) => ({
        value: currency,
        label: currency,
      }));
      break;
    }
    case "ECO":
    case "FUTURES": {
      // ECO and FUTURES use ecosystem tokens (custom tokens)
      const ecoCurrencies = await models.ecosystemToken.findAll({
        where: { status: true },
      });

      targetCurrencies = ecoCurrencies
        .map((currency) => ({
          value: currency.currency,
          label: `${currency.currency} - ${currency.name}`,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
      break;
    }
    default:
      throw createError(
        400,
        `Unsupported target wallet type: ${targetWalletType}`
      );
  }

  return { from: currencies, to: targetCurrencies };
}

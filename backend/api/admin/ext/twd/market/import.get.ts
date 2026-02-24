import { models, sequelize } from "@b/db";
import {
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { Op } from "sequelize";

export const metadata = {
  summary: "Import TWD Markets from TwelveData API",
  operationId: "importTwdMarkets",
  tags: ["Admin", "TWD", "Market"],
  description:
    "Imports forex pairs, stocks, and indices from TwelveData API, processes their data, and saves them to the database. Optionally filter by market type.",
  requiresAuth: true,
  parameters: [
    {
      name: "type",
      in: "query",
      description:
        "Filter import by market type (forex, stocks, indices). If not specified, imports all types.",
      schema: { type: "string", enum: ["forex", "stocks", "indices"] },
      required: false,
    },
  ],
  responses: {
    200: {
      description: "Markets imported successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              message: { type: "string" },
              imported: {
                type: "object",
                properties: {
                  forex: { type: "number" },
                  stocks: { type: "number" },
                  indices: { type: "number" },
                },
              },
            },
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("TWD Provider"),
    500: serverErrorResponse,
  },
  permission: "Access TWD Market Management",
};

// Import configuration - adjust these limits as needed
const IMPORT_LIMITS = {
  // Forex: Major and minor pairs only (exclude exotic crosses)
  forexMaxPairs: 150,
  forexIncludeGroups: ["Major", "Minor"], // Exclude "Exotic", "Exotic-Cross"

  // Stocks: US exchanges only, limit to top stocks
  stocksMaxCount: 2000,
  stocksExchanges: ["NASDAQ", "NYSE", "AMEX", "NYSE ARCA"], // US exchanges only

  // Indices: Top global indices
  indicesMaxCount: 150,

  // Database batch size for upsert
  batchSize: 1000,
};

export default async (data: Handler) => {
  const { query } = data;
  const importType = query?.type as string | undefined; // Optional: "forex", "stocks", "indices"

  console.log("[TWD Import] Starting market import...");
  console.log("[TWD Import] Import type:", importType || "all");
  console.log("[TWD Import] Import limits:", IMPORT_LIMITS);

  const apiKey = process.env.TWD_API_KEY;
  const baseUrl = process.env.TWD_BASE_URL || "https://api.twelvedata.com";

  console.log("[TWD Import] API Key present:", !!apiKey);
  console.log("[TWD Import] API Key length:", apiKey?.length || 0);
  console.log("[TWD Import] Base URL:", baseUrl);

  if (!apiKey) {
    const errorMsg = "TWD_API_KEY is not configured in .env file";
    console.error("[TWD Import] ERROR:", errorMsg);
    throw new Error(errorMsg);
  }

  // Check if TWD provider is enabled in the exchange table
  console.log("[TWD Import] Checking provider status in exchange table...");
  const provider = await models.exchange.findOne({
    where: {
      productId: "twelvedata",
    },
  });

  console.log("[TWD Import] Provider found:", !!provider);
  console.log("[TWD Import] Provider status:", provider?.status);
  console.log("[TWD Import] Provider details:", {
    name: provider?.name,
    title: provider?.title,
    status: provider?.status,
  });

  if (!provider) {
    const errorMsg =
      "TwelveData provider not found in database. Please restart the backend.";
    console.error("[TWD Import] ERROR:", errorMsg);
    throw new Error(errorMsg);
  }

  if (!provider.status) {
    const errorMsg = "TwelveData provider is disabled. Please enable it first.";
    console.error("[TWD Import] ERROR:", errorMsg);
    throw new Error(errorMsg);
  }

  console.log(
    "[TWD Import] Provider check passed, proceeding with API calls..."
  );

  const importedMarkets: {
    forex: any[];
    stocks: any[];
    indices: any[];
  } = {
    forex: [],
    stocks: [],
    indices: [],
  };

  try {
    // 1. Fetch Forex Pairs (if not filtering or if filtering for forex)
    if (!importType || importType === "forex") {
      const forexUrl = `${baseUrl}/forex_pairs?apikey=${apiKey}`;
      console.log(
        "[TWD Import] Fetching forex pairs from:",
        `${baseUrl}/forex_pairs`
      );

      const forexResponse = await fetch(forexUrl);
      console.log(
        "[TWD Import] Forex response status:",
        forexResponse.status,
        forexResponse.statusText
      );

      if (forexResponse.ok) {
        const forexData = await forexResponse.json();
        console.log("[TWD Import] Forex data structure:", {
          hasData: !!forexData.data,
          isArray: Array.isArray(forexData.data),
          count: forexData.data?.length || 0,
          firstItem: forexData.data?.[0],
        });

        if (forexData.data && Array.isArray(forexData.data)) {
          // Filter forex: Only major and minor pairs
          const filteredForex = forexData.data.filter((item: any) => {
            const group = item.currency_group?.toLowerCase() || "";
            return IMPORT_LIMITS.forexIncludeGroups.some((g) =>
              group.includes(g.toLowerCase())
            );
          });

          console.log(
            `[TWD Import] Filtered forex: ${filteredForex.length} / ${forexData.data.length} (kept ${IMPORT_LIMITS.forexIncludeGroups.join(", ")})`
          );

          // Limit to max count
          const limitedForex = filteredForex.slice(
            0,
            IMPORT_LIMITS.forexMaxPairs
          );

          importedMarkets.forex = limitedForex.map((item: any) => ({
            symbol: item.symbol,
            type: "forex" as const,
            name: item.currency_base
              ? `${item.currency_base}/${item.currency_quote}`
              : item.symbol,
            currency: item.currency_base || item.symbol.split("/")[0],
            pair: item.currency_quote || item.symbol.split("/")[1],
            exchange: null,
            metadata: {
              currency_group: item.currency_group,
              currency_base: item.currency_base,
              currency_quote: item.currency_quote,
            },
            status: false,
          }));
          console.log(
            "[TWD Import] Processed",
            importedMarkets.forex.length,
            "forex pairs"
          );
        }
      } else {
        const errorText = await forexResponse.text();
        console.error(
          "[TWD Import] Forex API error:",
          forexResponse.status,
          errorText.substring(0, 200)
        );
      }
    } else {
      console.log("[TWD Import] Skipping forex (filtered out)");
    }

    // 2. Fetch Stocks (if not filtering or if filtering for stocks)
    if (!importType || importType === "stocks") {
      const stocksUrl = `${baseUrl}/stocks?apikey=${apiKey}`;
      console.log("[TWD Import] Fetching stocks from:", `${baseUrl}/stocks`);

      const stocksResponse = await fetch(stocksUrl);
      console.log(
        "[TWD Import] Stocks response status:",
        stocksResponse.status,
        stocksResponse.statusText
      );

      if (stocksResponse.ok) {
        const stocksData = await stocksResponse.json();
        console.log("[TWD Import] Stocks data structure:", {
          hasData: !!stocksData.data,
          isArray: Array.isArray(stocksData.data),
          count: stocksData.data?.length || 0,
        });

        if (stocksData.data && Array.isArray(stocksData.data)) {
          // Filter stocks: Only selected exchanges (US markets)
          const filteredStocks = stocksData.data.filter((item: any) => {
            const exchange = item.exchange || item.mic_code || "";
            return IMPORT_LIMITS.stocksExchanges.some((ex) =>
              exchange.toUpperCase().includes(ex)
            );
          });

          console.log(
            `[TWD Import] Filtered stocks: ${filteredStocks.length} / ${stocksData.data.length} (kept ${IMPORT_LIMITS.stocksExchanges.join(", ")})`
          );

          // Limit to max count
          const limitedStocks = filteredStocks.slice(
            0,
            IMPORT_LIMITS.stocksMaxCount
          );

          importedMarkets.stocks = limitedStocks.map((item: any) => ({
            symbol: item.symbol,
            type: "stocks" as const,
            name: item.name || item.symbol,
            currency: item.currency || "USD",
            pair: null,
            exchange: item.exchange || item.mic_code || null,
            metadata: {
              country: item.country,
              type: item.type,
              mic_code: item.mic_code,
              access: item.access,
            },
            status: false,
          }));
          console.log(
            "[TWD Import] Processed",
            importedMarkets.stocks.length,
            "stocks"
          );
        }
      } else {
        const errorText = await stocksResponse.text();
        console.error(
          "[TWD Import] Stocks API error:",
          stocksResponse.status,
          errorText.substring(0, 200)
        );
      }
    } else {
      console.log("[TWD Import] Skipping stocks (filtered out)");
    }

    // 3. Fetch Indices (if not filtering or if filtering for indices)
    if (!importType || importType === "indices") {
      const indicesUrl = `${baseUrl}/indices?apikey=${apiKey}`;
      console.log("[TWD Import] Fetching indices from:", `${baseUrl}/indices`);

      const indicesResponse = await fetch(indicesUrl);
      console.log(
        "[TWD Import] Indices response status:",
        indicesResponse.status,
        indicesResponse.statusText
      );

      if (indicesResponse.ok) {
        const indicesData = await indicesResponse.json();
        console.log("[TWD Import] Indices data structure:", {
          hasData: !!indicesData.data,
          isArray: Array.isArray(indicesData.data),
          count: indicesData.data?.length || 0,
        });

        if (indicesData.data && Array.isArray(indicesData.data)) {
          // Limit indices to max count
          const limitedIndices = indicesData.data.slice(
            0,
            IMPORT_LIMITS.indicesMaxCount
          );

          importedMarkets.indices = limitedIndices.map((item: any) => ({
            symbol: item.symbol,
            type: "indices" as const,
            name: item.name || item.symbol,
            currency: item.currency || "USD",
            pair: null,
            exchange: item.country || null,
            metadata: {
              country: item.country,
            },
            status: false,
          }));
          console.log(
            "[TWD Import] Processed",
            importedMarkets.indices.length,
            "indices (limited from",
            indicesData.data.length,
            ")"
          );
        }
      } else {
        const errorText = await indicesResponse.text();
        console.error(
          "[TWD Import] Indices API error:",
          indicesResponse.status,
          errorText.substring(0, 200)
        );
      }
    } else {
      console.log("[TWD Import] Skipping indices (filtered out)");
    }

    // Combine all markets
    console.log("[TWD Import] Combining markets...");
    const combinedMarkets = [
      ...importedMarkets.forex,
      ...importedMarkets.stocks,
      ...importedMarkets.indices,
    ];

    console.log("[TWD Import] Total markets fetched:", combinedMarkets.length);
    console.log("[TWD Import] Breakdown:", {
      forex: importedMarkets.forex.length,
      stocks: importedMarkets.stocks.length,
      indices: importedMarkets.indices.length,
    });

    // Deduplicate by symbol (UNIQUE constraint on symbol field)
    // Keep first occurrence (forex prioritized, then stocks, then indices)
    const symbolsSeen = new Set<string>();
    const allNewMarkets: any[] = [];
    let duplicatesSkipped = 0;

    for (const market of combinedMarkets) {
      if (symbolsSeen.has(market.symbol)) {
        duplicatesSkipped++;
        continue;
      }
      symbolsSeen.add(market.symbol);
      allNewMarkets.push(market);
    }

    console.log(
      "[TWD Import] After deduplication:",
      allNewMarkets.length,
      "markets"
    );
    if (duplicatesSkipped > 0) {
      console.log(
        "[TWD Import] Skipped",
        duplicatesSkipped,
        "duplicate symbols"
      );
    }

    if (allNewMarkets.length === 0) {
      const errorMsg =
        "No markets were fetched from TwelveData API. Please check your API key and connection.";
      console.error("[TWD Import] ERROR:", errorMsg);
      throw new Error(errorMsg);
    }

    // Get all existing markets
    console.log("[TWD Import] Fetching existing markets from database...");
    const existingMarkets = await models.twdMarket.findAll({
      attributes: ["symbol"],
    });
    const existingSymbols = new Set(existingMarkets.map((m) => m.symbol));

    // Get all new symbols
    const newSymbols = new Set(allNewMarkets.map((m) => m.symbol));

    // Determine markets to delete (exist in DB but not in new import)
    const symbolsToDelete = [...existingSymbols].filter(
      (symbol) => !newSymbols.has(symbol)
    );

    console.log("[TWD Import] Existing markets:", existingSymbols.size);
    console.log("[TWD Import] Markets to delete:", symbolsToDelete.length);

    // Begin transaction with batched upsert
    console.log("[TWD Import] Starting database transaction...");
    let totalCreated = 0;
    let totalUpdated = 0;

    try {
      await sequelize.transaction(async (transaction) => {
        // Delete markets that are no longer available
        if (symbolsToDelete.length > 0) {
          console.log(
            "[TWD Import] Deleting",
            symbolsToDelete.length,
            "obsolete markets"
          );
          await models.twdOrder.destroy({
            where: { symbol: { [Op.in]: symbolsToDelete } },
            transaction,
          });
          await models.twdMarket.destroy({
            where: { symbol: { [Op.in]: symbolsToDelete } },
            transaction,
          });
        }

        // Process markets in batches to avoid overwhelming the database
        const batchSize = IMPORT_LIMITS.batchSize;
        const totalBatches = Math.ceil(allNewMarkets.length / batchSize);

        console.log(
          `[TWD Import] Upserting ${allNewMarkets.length} markets in ${totalBatches} batches (${batchSize} per batch)...`
        );

        for (let i = 0; i < allNewMarkets.length; i += batchSize) {
          const batch = allNewMarkets.slice(i, i + batchSize);
          const batchNum = Math.floor(i / batchSize) + 1;

          console.log(
            `[TWD Import] Processing batch ${batchNum}/${totalBatches} (${batch.length} markets)...`
          );

          // Get existing markets in this batch
          const batchSymbols = batch.map((m) => m.symbol);
          const existingInBatch = await models.twdMarket.findAll({
            where: { symbol: { [Op.in]: batchSymbols } },
            attributes: ["symbol", "status", "isTrending", "isHot"],
            transaction,
          });

          const existingMap = new Map(
            existingInBatch.map((m) => [m.symbol, m])
          );

          const toCreate: any[] = [];
          const toUpdate: any[] = [];

          for (const market of batch) {
            const existing = existingMap.get(market.symbol);
            if (existing) {
              // Update existing (preserve status flags)
              toUpdate.push({
                symbol: market.symbol,
                name: market.name,
                type: market.type,
                currency: market.currency,
                pair: market.pair,
                exchange: market.exchange,
                metadata: JSON.stringify(market.metadata),
              });
            } else {
              // Create new
              toCreate.push({
                symbol: market.symbol,
                type: market.type,
                name: market.name,
                currency: market.currency,
                pair: market.pair,
                exchange: market.exchange,
                metadata: JSON.stringify(market.metadata),
                isTrending: false,
                isHot: false,
                status: false,
              });
            }
          }

          // Bulk create new markets (ignore duplicates as safety net)
          if (toCreate.length > 0) {
            await models.twdMarket.bulkCreate(toCreate, {
              transaction,
              ignoreDuplicates: true, // Skip duplicates gracefully
            });
            totalCreated += toCreate.length;
            console.log(
              `[TWD Import] Batch ${batchNum}: Created ${toCreate.length} new markets`
            );
          }

          // Bulk update existing markets
          if (toUpdate.length > 0) {
            for (const update of toUpdate) {
              await models.twdMarket.update(update, {
                where: { symbol: update.symbol },
                transaction,
              });
            }
            totalUpdated += toUpdate.length;
            console.log(
              `[TWD Import] Batch ${batchNum}: Updated ${toUpdate.length} existing markets`
            );
          }
        }

        console.log("[TWD Import] All batches complete:", {
          created: totalCreated,
          updated: totalUpdated,
          deleted: symbolsToDelete.length,
        });

        // Auto-enable configured TWD symbols after import
        // Default to EUR/USD, or use env variable to customize
        const enabledSymbolsEnv =
          process.env.TWD_DEFAULT_ENABLED_SYMBOLS || "EUR/USD";
        const symbolsToEnable = enabledSymbolsEnv
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        if (symbolsToEnable.length > 0) {
          console.log(
            `[TWD Import] Auto-enabling symbols: ${symbolsToEnable.join(", ")}`
          );

          // Enable configured symbols (does NOT disable others)
          const enableResult = await models.twdMarket.update(
            { status: true },
            {
              where: { symbol: { [Op.in]: symbolsToEnable } },
              transaction,
            }
          );

          console.log(
            `[TWD Import] Auto-enabled ${enableResult[0]} markets: ${symbolsToEnable.join(", ")}`
          );
        } else {
          console.log("[TWD Import] No symbols configured for auto-enable");
        }
      });
    } catch (dbError: any) {
      console.error("[TWD Import] Database transaction error:", {
        name: dbError.name,
        message: dbError.message,
        code: dbError.parent?.code,
        sqlState: dbError.parent?.sqlState,
        sql: dbError.parent?.sql?.substring(0, 200),
      });
      throw new Error(`Database error during import: ${dbError.message}`);
    }

    console.log("[TWD Import] Import successful!");
    return {
      message: "TWD markets imported and saved successfully!",
      imported: {
        forex: importedMarkets.forex.length,
        stocks: importedMarkets.stocks.length,
        indices: importedMarkets.indices.length,
      },
    };
  } catch (error) {
    console.error("[TWD Import] FATAL ERROR:", error);
    console.error("[TWD Import] Error stack:", error.stack);

    // Provide detailed error message
    const errorMessage = error.message || "Unknown error occurred";
    const detailedError = `Failed to import TWD markets: ${errorMessage}`;

    console.error("[TWD Import] Throwing error:", detailedError);
    throw new Error(detailedError);
  }
};

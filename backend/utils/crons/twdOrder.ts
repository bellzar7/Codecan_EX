import { getTwdWalletPair, updateWalletBalance } from "@b/api/ext/twd/utils";
import { models, sequelize } from "@b/db";
import { logError } from "../logger";
import { RedisSingleton } from "../redis";

const redis = RedisSingleton.getInstance();

/**
 * Process TWD LIMIT orders
 * Executes LIMIT orders when current market price matches the order price
 * Runs every 1 minute
 */
export async function processTwdLimitOrders() {
  try {
    // Fetch all OPEN LIMIT orders
    const openOrders = await models.twdOrder.findAll({
      where: {
        status: "OPEN",
        type: "LIMIT",
      },
    });

    if (openOrders.length === 0) {
      return; // No orders to process
    }

    console.log(`[TWD] Processing ${openOrders.length} LIMIT orders...`);

    // Group orders by symbol to minimize API calls
    const ordersBySymbol: Map<string, typeof openOrders> = new Map();

    for (const order of openOrders) {
      if (!ordersBySymbol.has(order.symbol)) {
        ordersBySymbol.set(order.symbol, []);
      }
      ordersBySymbol.get(order.symbol)?.push(order);
    }

    // Process each symbol
    for (const [symbol, orders] of ordersBySymbol.entries()) {
      try {
        // Fetch current price from Redis ticker cache (updated by eco-ws)
        const tickerKey = `twd:ticker:${symbol}`;
        const cached = await redis.get(tickerKey);

        if (!cached) {
          console.warn(
            `[TWD Cron] No ticker data for ${symbol}, skipping orders`
          );
          continue; // Skip this symbol if no price available
        }

        let currentPrice: number;
        try {
          const ticker = JSON.parse(cached);
          currentPrice = ticker.price;

          if (
            !currentPrice ||
            Number.isNaN(currentPrice) ||
            currentPrice <= 0
          ) {
            console.error(
              `[TWD Cron] Invalid price for ${symbol}:`,
              currentPrice
            );
            continue;
          }
        } catch (parseError) {
          console.error(
            `[TWD Cron] Failed to parse ticker for ${symbol}:`,
            parseError
          );
          continue;
        }

        console.log(
          `[TWD Cron] Processing ${orders.length} orders for ${symbol} at price ${currentPrice}`
        );

        // Check each order
        for (const order of orders) {
          try {
            let shouldExecute = false;

            // Check if order should execute
            if (order.side === "BUY" && currentPrice <= Number(order.price)) {
              shouldExecute = true; // BUY when market price reaches or goes below limit price
            } else if (
              order.side === "SELL" &&
              currentPrice >= Number(order.price)
            ) {
              shouldExecute = true; // SELL when market price reaches or goes above limit price
            }

            if (shouldExecute) {
              await executeOrder(order, currentPrice);
              console.log(
                `[TWD] Executed ${order.side} order ${order.id} for ${symbol} at ${currentPrice}`
              );
            }
          } catch (orderError) {
            console.error(
              `[TWD] Error processing order ${order.id}:`,
              orderError.message
            );

            // Mark order as REJECTED if execution fails
            await models.twdOrder.update(
              {
                status: "REJECTED",
              },
              {
                where: { id: order.id },
              }
            );
          }
        }
      } catch (symbolError) {
        console.error(
          `[TWD] Error fetching price for ${symbol}:`,
          symbolError.message
        );
        // Continue with other symbols
      }
    }
  } catch (error) {
    logError("processTwdLimitOrders", error, __filename);
  }
}

/**
 * Execute a single LIMIT order
 * Uses correct wallet type based on market type (FOREX for forex, SPOT for stocks/indices)
 */
async function executeOrder(order: any, executionPrice: number) {
  await sequelize.transaction(async (transaction) => {
    // Get market to determine wallet type
    const market = await models.twdMarket.findOne({
      where: { symbol: order.symbol },
    });

    if (!market) {
      throw new Error(`Market ${order.symbol} not found`);
    }

    // Get base and quote wallets using correct wallet type
    const { baseWallet, quoteWallet } = await getTwdWalletPair(
      order.userId,
      order.symbol,
      market.type
    );

    const amount = Number(order.amount);
    const cost = amount * executionPrice;
    const fee = Number(order.fee);

    if (order.side === "BUY") {
      // BUY LIMIT: Quote currency was already reserved when order was created
      // Now credit the base currency to base wallet
      await updateWalletBalance(
        baseWallet.id,
        baseWallet.balance + amount,
        transaction
      );
    } else {
      // SELL LIMIT: Base currency was already reserved when order was created
      // Now credit the proceeds (minus fee) to quote wallet
      const proceeds = cost - fee;
      await updateWalletBalance(
        quoteWallet.id,
        quoteWallet.balance + proceeds,
        transaction
      );
    }

    // Update order status
    await models.twdOrder.update(
      {
        status: "CLOSED",
        price: executionPrice, // Update with actual execution price
        filled: amount,
        remaining: 0,
        cost,
        updatedAt: new Date(),
      },
      {
        where: { id: order.id },
        transaction,
      }
    );
  });
}

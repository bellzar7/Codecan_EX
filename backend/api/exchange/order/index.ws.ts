import { getWallet } from "@b/api/finance/wallet/utils";
import { models } from "@b/db";
import { hasClients, sendMessageToRoute } from "@b/handler/Websocket";
import ExchangeManager from "@b/utils/exchange";
import { logError } from "@b/utils/logger";
import {
  formatWaitTime,
  handleExchangeError,
  loadBanStatus,
  saveBanStatus,
} from "../utils";
import { updateWalletQuery } from "./index.post";
import { type AdjustedOrder, adjustOrderData } from "./utils";

export const metadata = {};

interface TrackedOrder {
  id: string;
  status: string;
  price: number;
  amount: number;
  filled: number;
  remaining: number;
  timestamp: number;
}

interface UserOrder {
  id: string;
  referenceId: string;
  symbol: string;
  status: string;
  createdAt: Date;
}

interface ExchangeInstance {
  fetchOpenOrders: (symbol: string) => Promise<unknown[]>;
  fetchOrder: (orderId: number, symbol: string) => Promise<unknown>;
}

class OrderHandler {
  private static instance: OrderHandler;
  private trackedOrders: { [userId: string]: TrackedOrder[] } = {};
  private readonly watchedUserIds: Set<string> = new Set();
  private orderInterval: ReturnType<typeof setInterval> | null = null;
  private lastFetchTime = 0;
  private unblockTime = 0;

  private constructor() {
    this.addUserToWatchlist = this.addUserToWatchlist.bind(this);
    this.removeUserFromWatchlist = this.removeUserFromWatchlist.bind(this);
    this.addOrderToTrackedOrders = this.addOrderToTrackedOrders.bind(this);
    this.removeOrderFromTrackedOrders =
      this.removeOrderFromTrackedOrders.bind(this);
    this.fetchOrdersForUser = this.fetchOrdersForUser.bind(this);
  }

  static getInstance(): OrderHandler {
    if (!OrderHandler.instance) {
      OrderHandler.instance = new OrderHandler();
    }
    return OrderHandler.instance;
  }

  private startInterval() {
    if (!this.orderInterval) {
      this.orderInterval = setInterval(this.flushOrders.bind(this), 1000);
    }
  }

  private stopInterval() {
    if (this.orderInterval) {
      clearInterval(this.orderInterval);
      this.orderInterval = null;
    }
  }

  private async updateWalletBalance(
    userId: string,
    orderParam: AdjustedOrder,
    _provider: string | null
  ) {
    try {
      if (!orderParam.symbol) {
        throw new Error("Order symbol is required");
      }
      const [currency, pair] = orderParam.symbol.split("/");
      const market = await models.exchangeMarket.findOne({
        where: { currency, pair },
      });

      if (!market?.metadata) {
        throw new Error("Market data not found");
      }

      const metadata =
        typeof market.metadata === "string"
          ? JSON.parse(market.metadata)
          : market.metadata;

      // Determine fee rate based on order side
      const feeRate =
        orderParam.side === "BUY"
          ? Number(metadata.taker)
          : Number(metadata.maker);

      // Recalculate with proper fee rate
      const amount = Number(orderParam.amount);
      const cost = Number(orderParam.cost);
      const fee = amount * (feeRate / 100);

      const currencyWallet = await getWallet(userId, "SPOT", currency);
      const pairWallet = await getWallet(userId, "SPOT", pair);

      if (!(currencyWallet && pairWallet)) {
        throw new Error("Wallet not found");
      }

      if (orderParam.side === "BUY") {
        const newBalance = currencyWallet.balance + (amount - fee);
        await updateWalletQuery(currencyWallet.id, newBalance);
      } else {
        const newBalance = pairWallet.balance + (cost - fee);
        await updateWalletQuery(pairWallet.id, newBalance);
      }
    } catch (error) {
      logError("wallet", error, __filename);
    }
  }

  private flushOrders() {
    if (Object.keys(this.trackedOrders).length > 0) {
      const route = "/api/exchange/order";
      const streamKey = "orders";
      for (const userId of Object.keys(this.trackedOrders)) {
        let orders = this.trackedOrders[userId];
        orders = orders.filter(
          (order) =>
            order.price &&
            order.amount &&
            order.filled !== undefined &&
            order.remaining !== undefined &&
            order.timestamp
        );

        const seenOrders = new Set<string>();
        orders = orders.filter((order) => {
          const isDuplicate = seenOrders.has(order.id);
          seenOrders.add(order.id);
          return !isDuplicate;
        });

        if (orders.length > 0) {
          sendMessageToRoute(
            route,
            { userId },
            { stream: streamKey, data: orders }
          );
        }
      }
      this.trackedOrders = {};
    } else {
      this.stopInterval();
    }
  }

  private async fetchOpenOrdersWithRetries(
    exchange: ExchangeInstance,
    symbol: string,
    provider: string | null
  ): Promise<AdjustedOrder[] | undefined> {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        if (Date.now() < this.unblockTime) {
          throw new Error(
            `Blocked until ${new Date(this.unblockTime).toLocaleString()}`
          );
        }

        // Fetch open orders
        // biome-ignore lint/suspicious/noExplicitAny: External exchange API returns dynamic data
        const orders = (await exchange.fetchOpenOrders(symbol)) as any[];

        // Get metadata for the symbol
        const [currency, pair] = symbol.split("/");
        const market = await models.exchangeMarket.findOne({
          where: { currency, pair },
        });

        if (!market?.metadata) {
          throw new Error("Market data not found");
        }

        const metadata =
          typeof market.metadata === "string"
            ? JSON.parse(market.metadata)
            : market.metadata;

        // Map and adjust each order using metadata-based fee info
        const adjustedOrders = orders.map((order) => {
          const feeRate =
            order.side === "BUY"
              ? Number(metadata.taker)
              : Number(metadata.maker);
          return adjustOrderData(order, provider, feeRate);
        });

        return adjustedOrders.map((order) => ({
          ...order,
          status: order.status?.toUpperCase() ?? "UNKNOWN",
        }));
      } catch (error) {
        const result = await handleExchangeError(error, ExchangeManager);
        if (typeof result === "number") {
          this.unblockTime = result;
          await saveBanStatus(this.unblockTime);
          throw error;
        }
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
        } else {
          throw error;
        }
      }
    }
  }

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex retry logic with multiple error handling paths
  private async fetchOrder(
    exchange: ExchangeInstance,
    orderId: string,
    symbol: string,
    provider: string | null
  ): Promise<AdjustedOrder | null | undefined> {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        if (Date.now() < this.unblockTime) {
          throw new Error(
            `Blocked until ${new Date(this.unblockTime).toLocaleString()}`
          );
        }

        // Fetch order details
        const order = (await exchange.fetchOrder(
          Number(orderId),
          symbol
          // biome-ignore lint/suspicious/noExplicitAny: External exchange API returns dynamic data
        )) as any;
        order.status = order.status?.toUpperCase() ?? "UNKNOWN";

        // Get metadata for the symbol
        const [currency, pair] = symbol.split("/");
        const market = await models.exchangeMarket.findOne({
          where: { currency, pair },
        });

        if (!market?.metadata) {
          throw new Error("Market data not found");
        }

        const metadata =
          typeof market.metadata === "string"
            ? JSON.parse(market.metadata)
            : market.metadata;

        // Pass fee rate and currency for adjusting the order data
        const feeRate =
          order.side === "BUY"
            ? Number(metadata.taker)
            : Number(metadata.maker);

        return adjustOrderData(order, provider, feeRate);
      } catch (error: unknown) {
        const result = await handleExchangeError(error, ExchangeManager);
        if (typeof result === "number") {
          this.unblockTime = result;
          await saveBanStatus(this.unblockTime);
          throw error;
        }
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (
          errorMessage.includes(
            "Order was canceled or expired with no executed qty over 90 days ago and has been archived"
          )
        ) {
          await this.removeOrder(orderId);
          return null;
        }
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
        } else {
          throw error;
        }
      }
    }
  }

  private async updateOrder(orderId: string, data: Partial<AdjustedOrder>) {
    try {
      await models.exchangeOrder.update(
        { ...data },
        { where: { referenceId: orderId } }
      );
    } catch (error) {
      logError("exchange", error, __filename);
    }
  }

  private async removeOrder(orderId: string) {
    try {
      await models.exchangeOrder.destroy({
        where: { referenceId: orderId },
        force: true,
      });
    } catch (error) {
      logError("exchange", error, __filename);
    }
  }

  addUserToWatchlist(userId: string) {
    if (!this.watchedUserIds.has(userId)) {
      this.watchedUserIds.add(userId);
      this.trackedOrders[userId] = this.trackedOrders[userId] || [];
      if (!this.orderInterval) {
        this.startInterval();
      }
    }
  }

  removeUserFromWatchlist(userId: string) {
    if (this.watchedUserIds.has(userId)) {
      this.watchedUserIds.delete(userId);
      delete this.trackedOrders[userId];
    }
  }

  removeOrderFromTrackedOrders(userId: string, orderId: string) {
    if (this.trackedOrders[userId]) {
      this.trackedOrders[userId] = this.trackedOrders[userId].filter(
        (order) => order.id !== orderId
      );
      if (this.trackedOrders[userId].length === 0) {
        delete this.trackedOrders[userId];
        this.removeUserFromWatchlist(userId);
      }
    }
  }

  addOrderToTrackedOrders(userId: string, order: TrackedOrder) {
    this.trackedOrders[userId] = this.trackedOrders[userId] || [];
    this.trackedOrders[userId].push({
      id: order.id,
      status: order.status,
      price: order.price,
      amount: order.amount,
      filled: order.filled,
      remaining: order.remaining,
      timestamp: order.timestamp,
    });
  }

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex order tracking logic with multiple state transitions
  async fetchOrdersForUser(
    userId: string,
    userOrders: UserOrder[],
    exchange: ExchangeInstance,
    provider: string | null
  ) {
    let symbols = userOrders.map((order) => order.symbol);

    while (
      hasClients("/api/exchange/order") &&
      this.watchedUserIds.has(userId)
    ) {
      const currentTime = Date.now();
      if (currentTime - this.lastFetchTime < 5000) {
        await new Promise((resolve) =>
          setTimeout(resolve, 5000 - (currentTime - this.lastFetchTime))
        );
      }

      this.lastFetchTime = Date.now();

      for (const symbol of symbols) {
        try {
          if (Date.now() < this.unblockTime) {
            const waitTime = this.unblockTime - Date.now();
            console.log(
              `Waiting for ${formatWaitTime(waitTime)} until unblock time`
            );
            await new Promise((resolve) =>
              setTimeout(resolve, Math.min(waitTime, 60_000))
            );
            this.unblockTime = await loadBanStatus(); // Reload ban status
            continue;
          }

          const openOrders = await this.fetchOpenOrdersWithRetries(
            exchange,
            symbol,
            provider
          );

          if (!openOrders) {
            throw new Error("Failed to fetch open orders after retries");
          }

          for (const order of userOrders) {
            const updatedOrder = openOrders.find(
              (o) => o.id === order.referenceId
            );
            if (updatedOrder) {
              const updatedStatus = updatedOrder.status ?? "UNKNOWN";
              if (updatedStatus !== order.status) {
                this.addOrderToTrackedOrders(userId, {
                  id: order.id,
                  status: updatedStatus,
                  price: updatedOrder.price ?? 0,
                  amount: updatedOrder.amount,
                  filled: updatedOrder.filled ?? 0,
                  remaining: updatedOrder.remaining ?? 0,
                  timestamp: updatedOrder.timestamp ?? Date.now(),
                });
                await this.updateOrder(updatedOrder.id, {
                  status: updatedStatus.toUpperCase(),
                  price: updatedOrder.price,
                  filled: updatedOrder.filled,
                  remaining: updatedOrder.remaining,
                });
                if (updatedStatus === "CLOSED") {
                  userOrders.splice(userOrders.indexOf(order), 1);
                  await this.updateWalletBalance(
                    userId,
                    updatedOrder,
                    provider
                  );
                } else {
                  order.status = updatedStatus;
                }
              }
            } else {
              const fetchedOrder = await this.fetchOrder(
                exchange,
                order.referenceId,
                symbol,
                provider
              );

              if (fetchedOrder) {
                const fetchedStatus = fetchedOrder.status ?? "UNKNOWN";
                if (fetchedStatus !== order.status) {
                  this.addOrderToTrackedOrders(userId, {
                    id: order.id,
                    status: fetchedStatus,
                    price: fetchedOrder.price ?? 0,
                    amount: fetchedOrder.amount,
                    filled: fetchedOrder.filled ?? 0,
                    remaining: fetchedOrder.remaining ?? 0,
                    timestamp: fetchedOrder.timestamp ?? Date.now(),
                  });
                  await this.updateOrder(fetchedOrder.id, {
                    status: fetchedStatus.toUpperCase(),
                    price: fetchedOrder.price,
                    filled: fetchedOrder.filled,
                    remaining: fetchedOrder.remaining,
                  });
                  if (fetchedStatus === "CLOSED") {
                    userOrders.splice(userOrders.indexOf(order), 1);
                    await this.updateWalletBalance(
                      userId,
                      fetchedOrder,
                      provider
                    );
                  }
                }
              } else {
                await this.removeOrder(order.referenceId);
                userOrders.splice(userOrders.indexOf(order), 1);
                this.removeOrderFromTrackedOrders(userId, order.id);
                if (userOrders.length === 0) {
                  this.removeUserFromWatchlist(userId);
                  break;
                }
              }
            }
          }

          if (openOrders.length > 0) {
            this.trackedOrders[userId] = this.trackedOrders[userId] || [];
            for (const openOrder of openOrders) {
              if (
                !this.trackedOrders[userId].some((o) => o.id === openOrder.id)
              ) {
                this.addOrderToTrackedOrders(userId, {
                  id: openOrder.id,
                  status: openOrder.status ?? "UNKNOWN",
                  price: openOrder.price ?? 0,
                  amount: openOrder.amount,
                  filled: openOrder.filled ?? 0,
                  remaining: openOrder.remaining ?? 0,
                  timestamp: openOrder.timestamp ?? Date.now(),
                });
              }
            }
          }

          if (userOrders.length === 0) {
            this.removeUserFromWatchlist(userId);
            break;
          }

          if (Object.keys(this.trackedOrders).length > 0) {
            this.startInterval();
          } else {
            this.stopInterval();
          }
        } catch (error) {
          logError("exchange", error, __filename);
          symbols = symbols.filter((s) => s !== symbol);
          const filteredOrders = userOrders.filter(
            (order) => order.symbol !== symbol
          );
          userOrders.length = 0;
          userOrders.push(...filteredOrders);

          if (userOrders.length === 0) {
            this.removeUserFromWatchlist(userId);
            break;
          }
        }
      }
    }
  }

  async handleMessage(
    data: Handler,
    messageParam: string | { payload: { userId: string } }
  ) {
    const message =
      typeof messageParam === "string"
        ? JSON.parse(messageParam)
        : messageParam;

    const { user } = data;
    if (!user?.id) {
      return;
    }

    const { userId } = message.payload;
    if (!userId) {
      return;
    }

    if (user.id !== userId) {
      return;
    }

    if (this.watchedUserIds.has(userId)) {
      return;
    }
    this.addUserToWatchlist(userId);

    const userOrders = await models.exchangeOrder.findAll({
      where: { userId: user.id, status: "OPEN" },
      attributes: ["id", "referenceId", "symbol", "status", "createdAt"],
      raw: true,
    });

    if (!userOrders.length) {
      this.removeUserFromWatchlist(userId);
      return;
    }

    const exchange = await ExchangeManager.startExchange();
    if (!exchange) {
      return;
    }
    const provider = await ExchangeManager.getProvider();

    this.fetchOrdersForUser(userId, userOrders, exchange, provider);
  }
}

export default async (
  data: Handler,
  message: string | { payload: { userId: string } }
) => {
  const handler = OrderHandler.getInstance();
  await handler.handleMessage(data, message);
};

export const {
  addUserToWatchlist,
  removeUserFromWatchlist,
  addOrderToTrackedOrders,
  removeOrderFromTrackedOrders,
} = OrderHandler.getInstance();

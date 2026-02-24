// index.ws.ts

import { isMainThread } from "node:worker_threads";
import { models } from "@b/db";
import { createWorker } from "@b/utils/cron";
import { getEcosystemToken } from "@b/utils/eco/tokens";
import { createError } from "@b/utils/error";
import { EVMDeposits } from "./util/monitor/EVMDeposits";
import { MODeposits } from "./util/monitor/MODeposits";
import { MoneroDeposits } from "./util/monitor/MoneroDeposits";
import { SolanaDeposits } from "./util/monitor/SolanaDeposits";
import { TonDeposits } from "./util/monitor/TonDeposits";
import { TronDeposits } from "./util/monitor/TronDeposits";
import { UTXODeposits } from "./util/monitor/UTXODeposits";
import { verifyPendingTransactions } from "./util/PendingVerification";

const monitorInstances = new Map(); // Maps userId -> monitor instance
const monitorStopTimeouts = new Map(); // Maps userId -> stopPolling timeout ID
let workerInitialized = false;
export const metadata = {};

export default async (data: Handler, message) => {
  const { user } = data;

  if (!user?.id) {
    throw createError(401, "Unauthorized");
  }
  if (typeof message === "string") {
    try {
      message = JSON.parse(message);
    } catch (err) {
      console.error(`Failed to parse incoming message: ${err.message}`);
      throw createError(400, "Invalid JSON payload");
    }
  }

  const { currency, chain, address } = message.payload;

  const wallet = await models.wallet.findOne({
    where: {
      userId: user.id,
      currency,
      type: "ECO",
    },
  });

  if (!wallet) {
    throw createError(400, "Wallet not found");
  }
  if (!wallet.address) {
    throw createError(400, "Wallet address not found");
  }

  const addresses = await JSON.parse(wallet.address as any);
  const walletChain = addresses[chain];

  if (!walletChain) {
    throw createError(400, "Address not found");
  }

  const token = await getEcosystemToken(chain, currency);
  if (!token) {
    throw createError(400, "Token not found");
  }

  const contractType = token.contractType;
  const finalAddress =
    contractType === "NO_PERMIT" ? address : walletChain.address;

  const monitorKey = user.id;

  // Clear any pending stop timeouts since the user reconnected
  if (monitorStopTimeouts.has(monitorKey)) {
    clearTimeout(monitorStopTimeouts.get(monitorKey));
    monitorStopTimeouts.delete(monitorKey);
  }

  let monitor = monitorInstances.get(monitorKey);

  if (monitor) {
    // Monitor already exists, just reuse it
    console.log(`Reusing existing monitor for user ${monitorKey}`);
  } else {
    // No existing monitor for this user, create a new one
    monitor = createMonitor(chain, {
      wallet,
      chain,
      currency,
      address: finalAddress,
      contractType,
    });
    await monitor.watchDeposits();
    monitorInstances.set(monitorKey, monitor);
  }

  if (isMainThread && !workerInitialized) {
    await createWorker(
      "verifyPendingTransactions",
      verifyPendingTransactions,
      10_000
    );
    console.log("Verification worker started");
    workerInitialized = true;
  }
};

function createMonitor(chain: string, options: any) {
  const { wallet, currency, address, contractType } = options;

  if (["BTC", "LTC", "DOGE", "DASH"].includes(chain)) {
    return new UTXODeposits({ wallet, chain, address });
  }
  if (chain === "SOL") {
    return new SolanaDeposits({ wallet, chain, currency, address });
  }
  if (chain === "TRON") {
    return new TronDeposits({ wallet, chain, address });
  }
  if (chain === "XMR") {
    return new MoneroDeposits({ wallet });
  }
  if (chain === "TON") {
    return new TonDeposits({ wallet, chain, address });
  }
  if (chain === "MO" && contractType !== "NATIVE") {
    return new MODeposits({ wallet, chain, currency, address, contractType });
  }
  return new EVMDeposits({ wallet, chain, currency, address, contractType });
}

export const onClose = async (_ws, _route, clientId) => {
  // Clear any previous pending stop timeouts for this client
  if (monitorStopTimeouts.has(clientId)) {
    clearTimeout(monitorStopTimeouts.get(clientId));
    monitorStopTimeouts.delete(clientId);
  }

  const monitor = monitorInstances.get(clientId);

  if (monitor && typeof monitor.stopPolling === "function") {
    // Schedule stopPolling after 10 minutes if the user doesn't reconnect
    const timeoutId = setTimeout(
      () => {
        monitor.stopPolling();
        monitorStopTimeouts.delete(clientId);
        monitorInstances.delete(clientId);
      },
      10 * 60 * 1000
    ); // 10 minutes

    monitorStopTimeouts.set(clientId, timeoutId);
  }
};

// MODeposits.ts

import { chainConfigs } from "@b/utils/eco/chains";
import { getEcosystemToken } from "@b/utils/eco/tokens";
import { ethers, type JsonRpcProvider } from "ethers";
import { processTransaction } from "../DepositUtils";
import { chainProviders, initializeHttpProvider } from "../ProviderManager";
import type { IDepositMonitor } from "./IDepositMonitor";

interface MOOptions {
  wallet: walletAttributes;
  chain: string;
  currency: string;
  address: string;
  contractType: "PERMIT" | "NO_PERMIT";
}

export class MODeposits implements IDepositMonitor {
  private readonly wallet: walletAttributes;
  private readonly chain: string;
  private readonly currency: string;
  private readonly address: string;
  private readonly contractType: "PERMIT" | "NO_PERMIT";
  private intervalId: NodeJS.Timeout | null | number = null;
  private readonly stopOnFirstDeposit = true; // If set to false, keeps polling even after a deposit found
  private readonly pollingIntervalMs = 10_000; // 10 seconds
  private readonly maxBlocksPerPoll = 5000; // Limit the number of blocks fetched in one go to prevent large data dumps
  private backoffAttempts = 0;
  private readonly maxBackoffAttempts = 5; // After 5 backoffs, we stop trying

  constructor(options: MOOptions) {
    this.wallet = options.wallet;
    this.chain = options.chain;
    this.currency = options.currency;
    this.address = options.address;
    this.contractType = options.contractType;
  }

  public async watchDeposits(): Promise<void> {
    let provider = chainProviders.get(this.chain);

    if (!provider) {
      provider = await initializeHttpProvider(this.chain);
      if (!provider) {
        throw new Error(
          `Failed to initialize HTTP provider for chain ${this.chain}`
        );
      }
    }

    console.log(
      `Using polling for ${this.chain} ERC-20 deposits on address ${this.address}`
    );
    const token = await getEcosystemToken(this.chain, this.currency);
    if (!token) {
      throw new Error(
        `Token ${this.currency} not found for chain ${this.chain}`
      );
    }

    const decimals = token.decimals;
    const filter = {
      address: token.contract,
      topics: [
        ethers.id("Transfer(address,address,uint256)"),
        null,
        ethers.zeroPadValue(this.address, 32),
      ],
    };

    await this.pollForEvents(provider as JsonRpcProvider, filter, decimals);
  }

  private async pollForEvents(
    provider: JsonRpcProvider,
    filter: any,
    decimals: number
  ) {
    const pollingKey = `${this.chain}:${this.address}`;
    let lastBlock: number;
    try {
      lastBlock = await provider.getBlockNumber();
    } catch (err) {
      console.error(
        `Failed to get initial block number for ${pollingKey}: ${(err as Error).message}`
      );
      // Without initial block, we cannot start safely
      throw err;
    }

    this.intervalId = setInterval(async () => {
      try {
        const currentBlock = await provider.getBlockNumber();
        if (currentBlock > lastBlock) {
          // Process blocks in chunks if needed
          const fromBlock = lastBlock + 1;
          const toBlock = Math.min(
            currentBlock,
            fromBlock + this.maxBlocksPerPoll - 1
          );

          console.log(
            `Polling ${pollingKey} from block ${fromBlock} to ${toBlock}`
          );

          const logs = await provider.getLogs({
            ...filter,
            fromBlock,
            toBlock,
          });

          // Reset backoff attempts on success
          this.backoffAttempts = 0;

          for (const log of logs) {
            console.log(
              `New event detected on ${pollingKey}: TxHash=${log.transactionHash}`
            );

            const success = await processTransaction(
              this.contractType,
              log.transactionHash,
              provider,
              this.address,
              this.chain,
              decimals,
              chainConfigs[this.chain].decimals,
              this.wallet.id
            );

            if (success) {
              console.log(`Deposit recorded for ${pollingKey}.`);
              if (this.stopOnFirstDeposit) {
                console.log(
                  `Stop on first deposit enabled. Stopping polling for ${pollingKey}`
                );
                this.stopPolling();
                return;
              }
            }
          }

          // Update lastBlock to the block we processed up to
          lastBlock = toBlock;
        }
      } catch (error) {
        console.error(
          `Error during event polling for ${pollingKey}:`,
          (error as Error).message
        );

        this.backoffAttempts++;
        if (this.backoffAttempts > this.maxBackoffAttempts) {
          console.error(
            `Max backoff attempts reached for ${pollingKey}. Stopping polling.`
          );
          this.stopPolling();
          return;
        }

        // Exponential backoff: increase polling interval temporarily
        const backoffTime = this.pollingIntervalMs * 2 ** this.backoffAttempts;
        console.warn(
          `Backing off polling for ${pollingKey}. Next poll in ${backoffTime}ms`
        );
        if (this.intervalId) {
          clearInterval(this.intervalId);
          this.intervalId = null;
        }
        setTimeout(() => {
          this.intervalId = setInterval(
            () => this.pollForEvents(provider, filter, decimals),
            this.pollingIntervalMs
          );
        }, backoffTime);
      }
    }, this.pollingIntervalMs);
  }

  public stopPolling() {
    if (this.intervalId) {
      console.log(`Stopping polling for ${this.chain}:${this.address}`);
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

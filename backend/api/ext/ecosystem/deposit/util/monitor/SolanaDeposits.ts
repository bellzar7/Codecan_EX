// SolanaDeposits.ts

import SolanaService from "@b/blockchains/sol";
import { getEcosystemToken } from "@b/utils/eco/tokens";
import type { IDepositMonitor } from "./IDepositMonitor";

interface SolanaOptions {
  wallet: walletAttributes;
  chain: string;
  currency: string;
  address: string;
}

export class SolanaDeposits implements IDepositMonitor {
  private readonly wallet: walletAttributes;
  private readonly chain: string;
  private readonly currency: string;
  private readonly address: string;

  constructor(options: SolanaOptions) {
    this.wallet = options.wallet;
    this.chain = options.chain;
    this.currency = options.currency;
    this.address = options.address;
  }

  public async watchDeposits(): Promise<void> {
    const solanaService = await SolanaService.getInstance();

    if (this.currency === "SOL") {
      await solanaService.monitorSolanaDeposits(this.wallet, this.address);
    } else {
      const token = await getEcosystemToken(this.chain, this.currency);
      if (!token?.contract) {
        console.error(
          `SPL Token ${this.currency} not found or invalid mint address`
        );
        return;
      }
      await solanaService.monitorSPLTokenDeposits(
        this.wallet,
        this.address,
        token.contract
      );
    }
  }
}

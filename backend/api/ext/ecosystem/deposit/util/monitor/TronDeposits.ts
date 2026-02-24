// TronDeposits.ts

import TronService from "@b/blockchains/tron";
import type { IDepositMonitor } from "./IDepositMonitor";

interface TronOptions {
  wallet: walletAttributes;
  chain: string;
  address: string;
}

export class TronDeposits implements IDepositMonitor {
  private readonly wallet: walletAttributes;
  private readonly chain: string;
  private readonly address: string;

  constructor(options: TronOptions) {
    this.wallet = options.wallet;
    this.chain = options.chain;
    this.address = options.address;
  }

  public async watchDeposits(): Promise<void> {
    const tronService = await TronService.getInstance();
    await tronService.monitorTronDeposits(this.wallet, this.address);
  }
}

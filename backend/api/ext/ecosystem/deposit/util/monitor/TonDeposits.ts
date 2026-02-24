// TonDeposits.ts

import TonService from "@b/blockchains/ton";
import type { IDepositMonitor } from "./IDepositMonitor";

interface TonOptions {
  wallet: walletAttributes;
  chain: string;
  address: string;
}

export class TonDeposits implements IDepositMonitor {
  private readonly wallet: walletAttributes;
  private readonly chain: string;
  private readonly address: string;

  constructor(options: TonOptions) {
    this.wallet = options.wallet;
    this.chain = options.chain;
    this.address = options.address;
  }

  public async watchDeposits(): Promise<void> {
    const tonService = await TonService.getInstance();
    await tonService.monitorTonDeposits(this.wallet, this.address);
  }
}

// MoneroDeposits.ts

import MoneroService from "@b/blockchains/xmr";
import type { IDepositMonitor } from "./IDepositMonitor";

interface MoneroOptions {
  wallet: walletAttributes;
}

export class MoneroDeposits implements IDepositMonitor {
  private readonly wallet: walletAttributes;

  constructor(options: MoneroOptions) {
    this.wallet = options.wallet;
  }

  public async watchDeposits(): Promise<void> {
    const moneroService = await MoneroService.getInstance();
    await moneroService.monitorMoneroDeposits(this.wallet);
  }
}

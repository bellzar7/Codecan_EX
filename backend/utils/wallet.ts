import { models } from "@b/db";

export const getWalletAddressCondition = async () => {
  // Retrieve FIAT currencies
  const walletAddress = await models.depositWallet.findAll({
    where: { status: true },
  });
  console.log("walletAddress", walletAddress);
  // Return the structured currency conditions
  return {
    wallets: walletAddress.map((c) => ({
      value: c?.address,
      label: c?.title,
      network: c?.network,
    })),
  };
};

import {
  createSIWEConfig,
  formatMessage,
  type SIWECreateMessageArgs,
} from "@web3modal/siwe";
import { getSession, signIn, signOut } from "next-auth/react";
import {
  arbitrum,
  avalanche,
  bsc,
  fantom,
  mainnet,
  polygon,
} from "wagmi/chains";
import $fetch from "@/utils/api";

export const siweConfig = createSIWEConfig({
  getMessageParams: async () => ({
    domain: typeof window !== "undefined" ? window.location.host : "",
    uri: typeof window !== "undefined" ? window.location.origin : "",
    chains: [
      mainnet.id,
      arbitrum.id,
      polygon.id,
      bsc.id,
      fantom.id,
      avalanche.id,
    ],
    statement: "Please sign with your account",
    issuedAt: Math.floor(Date.now() / 1000),
  }),
  createMessage: ({ address, ...args }: SIWECreateMessageArgs) =>
    formatMessage(args, address),
  getNonce: async () => {
    const { data, error } = await $fetch({
      url: "/api/auth/login/nonce",
      silent: true,
    });

    if (error) {
      throw new Error("Failed to get nonce!");
    }
    return data as string;
  },
  getSession: async () => {
    const session = await getSession();
    if (!session) {
      throw new Error("Failed to get session!");
    }
    const { address, chainId } = session as unknown as {
      address: string;
      chainId: number;
    };
    return { address, chainId };
  },
  verifyMessage: async ({ message, signature }) => {
    try {
      const success = await signIn("credentials", {
        message,
        redirect: false,
        signature,
        callbackUrl: "/protected",
      });
      return Boolean(success?.ok);
    } catch (error) {
      return false;
    }
  },
  signOut: async () => {
    try {
      await signOut({
        redirect: false,
      });
      return true;
    } catch (error) {
      return false;
    }
  },
});

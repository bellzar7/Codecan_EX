import { useState } from "react";
import { toast } from "sonner";
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { siweConfig } from "@/utils/siwe";

export const useLoginWallet = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage(); // Use signMessageAsync to handle promises correctly
  const { connect, error } = useConnect();
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null); // State to store the message

  const handleWalletLogin = async (address: string, chainId: number) => {
    setLoading(true);
    try {
      if (!siweConfig) {
        throw new Error("SIWE configuration methods are not properly defined");
      }
      const messageParams = await (siweConfig as any).getMessageParams();
      const nonce = await (siweConfig as any).getNonce();
      const message = (siweConfig as any).createMessage({
        ...messageParams,
        address,
        nonce,
        chainId,
        version: "1",
      });

      // Call signMessageAsync directly to get the signature
      const signature = await signMessageAsync({ message });

      if (!signature) {
        throw new Error("Failed to sign message");
      }

      setSignature(signature);
      setMessage(message);
    } catch (error) {
      console.error(error);
      toast.error("Signing process was cancelled or failed.");
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async (connector: any) => {
    setLoading(true);
    try {
      await connect({ connector });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    disconnect();
    siweConfig.signOut();
  };

  return {
    isConnected,
    address,
    loading,
    connectWallet,
    disconnectWallet,
    error,
    handleWalletLogin,
    signature,
    message, // Export the message state
  };
};

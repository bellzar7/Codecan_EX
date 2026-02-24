import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { toast } from "sonner"; // Updated import for toast notifications
import { useAccount, useChainId, useConnect, useDisconnect } from "wagmi";
import Button from "@/components/elements/base/button/Button";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import { Tooltip } from "@/components/elements/base/tooltips/Tooltip";
import { useLoginWallet } from "@/hooks/useLoginWallet";
import { useDashboardStore } from "@/stores/dashboard";
import $fetch from "@/utils/api";

const defaultUserPath = process.env.NEXT_PUBLIC_DEFAULT_USER_PATH || "/user";

const WalletLogin = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { setIsFetched } = useDashboardStore();
  const { connectors, connect } = useConnect() as any;
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [walletLoading, setWalletLoading] = useState(false);
  const { handleWalletLogin, signature, message } = useLoginWallet(); // Added message to destructuring
  const [chain, setChain] = useState<number | null>(null);
  const chainId = useChainId();
  useEffect(() => {
    if (chainId) {
      setChain(chainId);
    }
  }, [chainId]);
  useEffect(() => {
    const signInWithWallet = async () => {
      if (signature && address && chain && message) {
        // Check if message is available
        try {
          const { data, error } = await $fetch({
            url: "/api/auth/login/wallet",
            method: "POST",
            body: { message, signature },
          });
          if (error || !data) {
            throw new Error("Signature verification failed");
          }
          setIsFetched(false);
          router.push(defaultUserPath);
        } catch (error) {
          console.error(error);
          toast.error("Failed to sign in with wallet.");
        }
      }
    };
    signInWithWallet();
  }, [signature, address, chain, message]); // Added message to dependencies
  // Filter out unique connectors based on name
  const uniqueConnectors = connectors.filter(
    (connector: any, index: number, self: any[]) =>
      (connector.name === "MetaMask" || connector.name === "WalletConnect") &&
      index === self.findIndex((c) => c.name === connector.name)
  );

  const handleDisconnect = () => {
    setWalletLoading(true);
    disconnect();
    setWalletLoading(false);
  };
  return (
    <div className="mb-5 flex w-full gap-2">
      {isConnected && address ? (
        <Tooltip content={t("Disconnect Wallet")}>
          <IconButton
            color="danger"
            disabled={walletLoading}
            loading={walletLoading}
            onClick={() => {
              handleDisconnect();
            }}
            variant="pastel"
          >
            <Icon className="h-6 w-6" icon="hugeicons:wifi-disconnected-01" />
          </IconButton>
        </Tooltip>
      ) : (
        <div className="flex w-full gap-2">
          {uniqueConnectors.map((connector) => (
            <div className="w-full" key={connector.id}>
              <Button
                className="w-full"
                color="warning"
                disabled={walletLoading}
                loading={walletLoading}
                onClick={() => {
                  setWalletLoading(true);
                  connect({ connector });
                  setWalletLoading(false);
                }}
                variant="pastel"
              >
                <Icon
                  className="mr-2 h-6 w-6"
                  icon={
                    connector.name === "MetaMask"
                      ? "logos:metamask-icon"
                      : "simple-icons:walletconnect"
                  }
                />
                {t("Connect")} {connector.name}
              </Button>
            </div>
          ))}
        </div>
      )}
      {isConnected && address && (
        <div className="w-full">
          <Button
            className="w-full"
            color="info"
            disabled={walletLoading}
            loading={walletLoading}
            onClick={() => handleWalletLogin(address, chain as number)}
          >
            <Icon className="mr-2 h-4 w-4" icon="simple-icons:walletconnect" />
            {t("Sign In With Wallet")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default WalletLogin;

import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { useAccount, useChainId, useConnect, useDisconnect } from "wagmi";
import Button from "@/components/elements/base/button/Button";
import { useDashboardStore } from "@/stores/dashboard";
import $fetch from "@/utils/api";

const WalletConnectButton = () => {
  const { t } = useTranslation();
  const { walletConnected, setWalletConnected } = useDashboardStore();
  const { connectors, connect } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [walletLoading, setWalletLoading] = useState(false);
  const chainId = useChainId();
  const handleConnect = async (connector) => {
    setWalletLoading(true);
    connect({ connector });
    setWalletLoading(false);
  };
  const handleDisconnect = async () => {
    setWalletLoading(true);
    await $fetch({
      url: "/api/user/profile/wallet/disconnect",
      method: "POST",
      body: { address },
    });
    disconnect();
    setWalletLoading(false);
    setWalletConnected(false);
  };
  const registerWalletAddress = async () => {
    const { data, error } = await $fetch({
      url: "/api/user/profile/wallet/connect",
      method: "POST",
      body: { address, chainId },
    });
    if (!error) {
      setWalletConnected(true);
    }
  };
  const uniqueConnectors = connectors.filter(
    (connector: any, index: number, self: any[]) =>
      (connector.name === "MetaMask" || connector.name === "WalletConnect") &&
      index === self.findIndex((c) => c.name === connector.name)
  );
  return (
    <div>
      {walletConnected && isConnected ? (
        <Button
          color="danger"
          disabled={walletLoading}
          loading={walletLoading}
          onClick={handleDisconnect}
          shape={"rounded-sm"}
        >
          <Icon
            className="mr-2 h-6 w-6"
            icon="hugeicons:wifi-disconnected-01"
          />
          {t("Remove Wallet")}
        </Button>
      ) : !walletConnected && isConnected ? (
        <Button
          color="success"
          disabled={walletLoading}
          loading={walletLoading}
          onClick={registerWalletAddress}
          shape={"rounded-sm"}
        >
          <Icon className="mr-2 h-6 w-6" icon="hugeicons:wifi-connected-03" />
          {t("Register Wallet")}
        </Button>
      ) : (
        <div className="flex gap-2">
          {uniqueConnectors.map((connector) => (
            <div className="w-full" key={connector.id}>
              <Button
                className="w-full"
                color="warning"
                disabled={walletLoading}
                loading={walletLoading}
                onClick={() => {
                  handleConnect(connector);
                }}
                shape={"rounded-sm"}
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
    </div>
  );
};
export default WalletConnectButton;

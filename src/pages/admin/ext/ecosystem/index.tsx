import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import type React from "react";
import { useEffect, useState } from "react";
import Button from "@/components/elements/base/button/Button";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import Card from "@/components/elements/base/card/Card";
import Modal from "@/components/elements/base/modal/Modal";
import Input from "@/components/elements/form/input/Input";
import Layout from "@/layouts/Default";
import $fetch from "@/utils/api";

const EcosystemBlockchains: React.FC = () => {
  const { t } = useTranslation();
  const [blockchains, setBlockchains] = useState<any>({
    baseChains: [],
    extendedChains: [],
    isUnlockedVault: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPassPhraseModelOpen, setIsPassPhraseModelOpen] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const router = useRouter();

  const fetchBlockchains = async () => {
    const { data, error } = await $fetch({
      url: "/api/admin/ext/ecosystem",
      silent: true,
    });
    if (!error) {
      const ecosystemData = data as any;
      setBlockchains({
        baseChains: ecosystemData.baseChains || [],
        extendedChains: ecosystemData.extendedChains || [],
        isUnlockedVault: ecosystemData.isUnlockedVault,
      });
    }
  };

  useEffect(() => {
    if (router.isReady) fetchBlockchains();
  }, [router.isReady]);

  const supportedChainsImagesMap = (chain: string) => {
    switch (chain) {
      case "ETH":
        return "eth";
      case "BSC":
        return "bnb";
      case "POLYGON":
        return "matic";
      case "FTM":
        return "ftm";
      case "OPTIMISM":
        return "op";
      case "ARBITRUM":
        return "arbitrum";
      case "BASE":
        return "base";
      case "CELO":
        return "celo";
      case "BTC":
        return "btc";
      case "LTC":
        return "ltc";
      case "DOGE":
        return "doge";
      case "DASH":
        return "dash";
      case "SOL":
        return "sol";
      case "TRON":
        return "trx";
      case "XMR":
        return "xmr";
      case "MO":
        return "mo";
      case "TON":
        return "ton";
      default:
        return chain.toLowerCase();
    }
  };

  const setPassphraseHandler = async () => {
    setIsSubmitting(true);
    const { error } = await $fetch({
      url: "/api/admin/ext/ecosystem/kms",
      method: "POST",
      body: { passphrase },
    });
    if (!error) {
      setIsPassPhraseModelOpen(false);
      setPassphrase("");
      await fetchBlockchains();
    }
    setIsSubmitting(false);
  };

  // Rendering logic for base UTXO blockchains
  const renderUtxoChains = (chains: any[]) =>
    chains?.map((item: any, index: number) => (
      <div className="flex flex-col items-center" key={index}>
        <img
          alt={`${item.chain} logo`}
          className="h-10 w-10 rounded-full"
          src={`/img/crypto/${supportedChainsImagesMap(item.chain)}.webp`}
        />
        <span className="font-semibold text-muted-800 text-sm dark:text-muted-200">
          {item.chain} ({item.info.network})
        </span>
        <ul className="text-xs">
          <li>
            <span className="text-muted-500">{t("Node")} </span>
            <span className="text-info-500">{item.info.nodeProvider}</span>
          </li>
        </ul>
      </div>
    ));

  // Rendering logic for base EVM blockchains
  const renderEvmChains = (chains: any[]) =>
    chains?.map((item: any, index: number) => (
      <div className="flex flex-col items-center" key={index}>
        <img
          alt={`${item.chain} logo`}
          className="h-10 w-10 rounded-full"
          src={`/img/crypto/${supportedChainsImagesMap(item.chain)}.webp`}
        />
        <span className="font-semibold text-muted-800 text-sm dark:text-muted-200">
          {item.chain} ({item.info.network})
        </span>
        <ul className="text-xs">
          <li
            className={`flex items-center gap-2 ${
              item.info.rpc ? "text-success-500" : "text-danger-500"
            }`}
          >
            <Icon
              className="h-3 w-3 text-current"
              icon={item.info.rpc ? "lucide:check" : "lucide:x"}
            />
            {t("RPC")}
          </li>
          <li
            className={`flex items-center gap-2 ${
              item.info.rpcWss ? "text-success-500" : "text-danger-500"
            }`}
          >
            <Icon
              className="h-3 w-3 text-current"
              icon={item.info.rpcWss ? "lucide:check" : "lucide:x"}
            />
            {t("RPC WSS")}
          </li>
          <li
            className={`flex items-center gap-2 ${
              item.info.explorerApi ? "text-success-500" : "text-danger-500"
            }`}
          >
            <Icon
              className="h-3 w-3 text-current"
              icon={item.info.explorerApi ? "lucide:check" : "lucide:x"}
            />
            {t("Explorer API")}
          </li>
        </ul>
      </div>
    ));

  // Rendering logic for extended blockchains (e.g., Solana)
  const renderExtendedChains = (chains: any[]) =>
    chains?.map((item: any, index: number) => (
      <div className="flex flex-col items-center" key={index}>
        <img
          alt={`${item.chain} logo`}
          className="h-10 w-10 rounded-full"
          src={`/img/crypto/${supportedChainsImagesMap(item.chain)}.webp`}
        />
        <span className="font-semibold text-muted-800 text-sm dark:text-muted-200">
          {item.chain} ({item.info.network})
        </span>
        <ul className="text-xs">
          <li>
            <span className="text-muted-500">{t("Network")} </span>
            <span className="text-info-500">{item.info.network}</span>
          </li>
          <li>
            <span className="text-muted-500">{t("Version")} </span>
            <span className="text-info-500">{item.info.version}</span>
          </li>
          <li
            className={`flex items-center gap-2 ${
              item.info.status ? "text-success-500" : "text-danger-500"
            }`}
          >
            <Icon
              className="h-3 w-3 text-current"
              icon={item.info.status ? "lucide:check" : "lucide:x"}
            />
            {item.info.status ? t("Active") : t("Inactive")}
          </li>
          {item.chain === "MO" && (
            <>
              <li
                className={`flex items-center gap-2 ${
                  item.info.rpc ? "text-success-500" : "text-danger-500"
                }`}
              >
                <Icon
                  className="h-3 w-3 text-current"
                  icon={item.info.rpc ? "lucide:check" : "lucide:x"}
                />
                {t("RPC")}
              </li>
              <li
                className={`flex items-center gap-2 ${
                  item.info.rpcWss ? "text-success-500" : "text-danger-500"
                }`}
              >
                <Icon
                  className="h-3 w-3 text-current"
                  icon={item.info.rpcWss ? "lucide:check" : "lucide:x"}
                />
                {t("RPC WSS")}
              </li>
            </>
          )}
          {/* button to install if its version still 0.0.1 */}
          {item.info.version === "0.0.1" && (
            <div className="mt-2 w-full">
              <Button
                className="w-full"
                color="primary"
                onClick={() =>
                  router.push(
                    `/admin/ext/ecosystem/blockchain/${item.info.productId}`
                  )
                }
                shape={"rounded-xs"}
                size="sm"
              >
                {t("Install")}
              </Button>
            </div>
          )}
          {/* button to activate if its installed but status false */}
          {!item.info.status && (
            <div className="mt-2 w-full">
              <Button
                className="w-full"
                color="success"
                onClick={() =>
                  router.push(
                    `/admin/ext/ecosystem/blockchain/${item.info.productId}`
                  )
                }
                shape={"rounded-xs"}
                size="sm"
              >
                {t("Activate")}
              </Button>
            </div>
          )}
          {/* if active and installed then we can show view button */}
          {item.info.status && item.info.version !== "0.0.1" && (
            <div className="mt-2 w-full">
              <Button
                className="w-full"
                color="info"
                onClick={() =>
                  router.push(
                    `/admin/ext/ecosystem/blockchain/${item.info.productId}`
                  )
                }
                shape={"rounded-xs"}
                size="sm"
              >
                {t("View")}
              </Button>
            </div>
          )}
        </ul>
      </div>
    ));

  return (
    <Layout color="muted" title={t("Ecosystem Blockchains")}>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg text-muted-800 dark:text-white">
            {t("Ecosystem Blockchains")}
          </h2>
          {blockchains.isUnlockedVault ? (
            <div className="flex items-center gap-2 rounded-md bg-success-100 px-3 py-1 text-md text-success-600">
              <Icon className="h-5 w-5" icon="line-md:confirm-circle" />
              {t("Vault Active")}
            </div>
          ) : (
            <Button
              className="ms-2"
              color="success"
              onClick={() => setIsPassPhraseModelOpen(true)}
            >
              <Icon className="mr-2 h-4 w-4" icon="lucide:lock" />
              {t("Initiate Vault")}
            </Button>
          )}
        </div>

        {/* Base Blockchains */}
        <Card className="space-y-5 p-5" color={"contrast"}>
          <h2 className="font-semibold text-lg text-muted-800 dark:text-white">
            {t("Built-in Blockchains")}
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {/* UTXO Chains */}
            {renderUtxoChains(
              blockchains.baseChains.filter((chain) =>
                ["BTC", "LTC", "DOGE", "DASH"].includes(chain.chain)
              )
            )}
            {/* EVM Chains */}
            {renderEvmChains(
              blockchains.baseChains.filter(
                (chain) => !["BTC", "LTC", "DOGE", "DASH"].includes(chain.chain)
              )
            )}
          </div>
        </Card>

        {/* Extended Blockchains */}
        <Card className="space-y-5 p-5" color={"contrast"}>
          <h2 className="font-semibold text-lg text-muted-800 dark:text-white">
            {t("Extended Blockchains")}
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {renderExtendedChains(blockchains.extendedChains)}
          </div>
        </Card>
      </div>

      <Modal open={isPassPhraseModelOpen} size="sm">
        <Card className="space-y-5">
          <div className="flex items-center justify-between p-4 md:p-6">
            <h3 className="font-heading font-medium text-lg text-muted-900 leading-6 dark:text-white">
              {t("Set Ecosystem Passphrase")}
            </h3>
            <IconButton
              onClick={() => setIsPassPhraseModelOpen(false)}
              shape="full"
              size="sm"
            >
              <Icon className="h-4 w-4" icon="lucide:x" />
            </IconButton>
          </div>
          <div className="p-4 md:p-6">
            <p className="mb-3 font-alt text-muted-500 text-sm leading-5 dark:text-muted-400">
              {t("Please enter the passphrase of the ecosystem vault.")}
            </p>
            <Input
              disabled={isSubmitting}
              label={t("Passphrase")}
              loading={isSubmitting}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder={t("Enter passphrase")}
              type="password"
              value={passphrase}
            />
          </div>
          <div className="p-4 md:p-6">
            <div className="flex justify-end gap-x-2">
              <Button onClick={() => setIsPassPhraseModelOpen(false)}>
                {t("Cancel")}
              </Button>
              <Button
                color="primary"
                disabled={isSubmitting}
                loading={isSubmitting}
                onClick={setPassphraseHandler}
                variant="solid"
              >
                {t("Submit")}
              </Button>
            </div>
          </div>
        </Card>
      </Modal>
    </Layout>
  );
};

export default EcosystemBlockchains;

export const permission = "Access Ecosystem Management";

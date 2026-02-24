import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { QRCodeSVG } from "qrcode.react";
import { memo, useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/elements/base/button/Button";
import Input from "@/components/elements/form/input/Input";
import Typewriter from "@/components/ui/Typewriter";
import { useDashboardStore } from "@/stores/dashboard";
import { useDepositStore } from "@/stores/user/wallet/deposit";

const DepositAddressBase = ({}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [userDepositAddress, setUserDepositAddress] = useState<any>(null);
  const {
    setSelectedDepositMethod,
    depositAddress,
    selectedWalletType,
    selectedDepositMethod,
    setStep,
    selectedCurrency,
    transactionHash,
    setTransactionHash,
    sendTransactionHash,
    loading,
    unlockAddress,
    contractType,
  } = useDepositStore();

  const { profile } = useDashboardStore();

  const copyToClipboard = () => {
    if (userDepositAddress?.address) {
      navigator.clipboard.writeText(userDepositAddress?.address);
      toast.success(t("Address copied to clipboard!"));
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (loading) {
        event.preventDefault();
        event.returnValue = t(
          "Please do not close this page until the verification is complete."
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [loading, t]);

  useEffect(() => {
    console.log("=== [DepositAddress] useEffect START ===");
    console.log("[DepositAddress] depositAddress from store:", depositAddress);

    // ✅ Simply use the depositAddress from store
    // The store (fetchDepositAddress) already handles the logic:
    // - If custom address exists -> depositAddress = custom address
    // - If no custom address -> depositAddress = null

    if (depositAddress) {
      console.log("[DepositAddress] ✅ Using custom address from store:", {
        address: depositAddress.address,
        currency: depositAddress.currency,
        network: depositAddress.network,
      });
      setUserDepositAddress(depositAddress);
    } else {
      console.log("[DepositAddress] ❌ No custom depositAddress configured");
      setUserDepositAddress(null);
    }

    console.log("=== [DepositAddress] useEffect END ===");
  }, [depositAddress]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Icon
            className="h-12 w-12 animate-spin text-primary-500"
            icon="mdi:loading"
          />
          <p className="text-primary-500 text-xl">
            {t("Processing payment...")}
          </p>
          <p className="text-primary-500 text-sm">
            {t(
              "Please do not close this page until the verification is complete."
            )}
          </p>
        </div>
      </div>
    );
  }

  // ❌ No custom address configured - show message
  if (!userDepositAddress) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Icon
          className="mb-4 h-16 w-16 text-warning-500"
          icon="mdi:alert-circle-outline"
        />
        <h3 className="mb-2 font-semibold text-2xl text-muted-800 dark:text-muted-100">
          {t("No Deposit Address Configured")}
        </h3>
        <p className="mb-4 text-muted-500 dark:text-muted-400">
          {t("Your account does not have a deposit address set up for")}{" "}
          <span className="font-semibold text-primary-500">
            {selectedCurrency}
          </span>
          {selectedDepositMethod && (
            <>
              {" "}
              {t("on")}{" "}
              <span className="font-semibold text-primary-500">
                {selectedDepositMethod}
              </span>{" "}
              {t("network")}
            </>
          )}
          .
        </p>
        <p className="mb-6 text-muted-500 dark:text-muted-400">
          {t("Please contact support to configure your deposit address.")}
        </p>
        <div className="flex gap-4">
          <Button
            color="default"
            onClick={() => {
              setSelectedDepositMethod(null, null);
              setStep(3);
            }}
            size="lg"
          >
            <Icon className="h-5 w-5" icon="mdi:chevron-left" />
            {t("Go Back")}
          </Button>
          <Button
            color="primary"
            onClick={() => router.push("/user/support")}
            size="lg"
          >
            <Icon className="mr-1 h-5 w-5" icon="mdi:lifebuoy" />
            {t("Contact Support")}
          </Button>
        </div>
      </div>
    );
  }

  // ✅ Has custom address - show deposit UI
  return (
    <div>
      <div className="mb-12 space-y-1 text-center font-sans">
        <h2 className="font-light text-2xl text-muted-800 dark:text-muted-100">
          {t("Deposit Address")}
        </h2>
        <p className="px-5 text-muted-400 text-sm">
          {t("Please send the amount to the following address in")}{" "}
          <span className="font-bold text-primary-500">
            {userDepositAddress?.network}
          </span>{" "}
          {t("network")}{" "}
          {userDepositAddress &&
            `and enter the transaction hash below to complete the deposit.
          Please note that the transaction hash is required for us to verify
          your deposit.`}
        </p>
      </div>

      <div className="mx-auto mb-4 w-full max-w-lg rounded-sm px-8 pb-8">
        <div className="flex flex-col items-center justify-center gap-5">
          <Typewriter className="hidden flex-start text-muted-800 sm:flex dark:text-muted-200">
            {userDepositAddress?.address}
          </Typewriter>
          <Button color={"info"} onClick={copyToClipboard} type="button">
            <Icon className="h-5 w-5" icon="mdi:content-copy" />
            {t("Copy Address")}
          </Button>
          <Input
            className="flex sm:hidden"
            readOnly
            value={userDepositAddress?.address}
          />
          <div className="bg-white p-5">
            <QRCodeSVG
              level={"H"}
              size={128}
              value={userDepositAddress?.address}
            />
          </div>
          {userDepositAddress?.info?.tag && (
            <div className="text-muted-400 text-sm">
              {t("Tag")} {userDepositAddress.info.tag}
            </div>
          )}
        </div>
        {userDepositAddress && (
          <>
            <Input
              className="w-full"
              label={t("Transaction Hash")}
              onChange={(e) => {
                setTransactionHash(e.target.value);
              }}
              placeholder={t("Enter transaction hash")}
              required
              value={transactionHash}
            />
          </>
        )}

        <div className="mt-6">
          <div className="flex w-full justify-center gap-4">
            <Button
              className="w-full"
              onClick={async () => {
                if (contractType === "NO_PERMIT" && userDepositAddress?.address)
                  await unlockAddress(userDepositAddress.address);
                setSelectedDepositMethod(null, null);
                setStep(2);
              }}
              size="lg"
              type="button"
            >
              <Icon className="h-5 w-5" icon="mdi:chevron-left" />
              {t("Go Back")}
            </Button>
            {userDepositAddress && (
              <Button
                className="w-full"
                color="primary"
                disabled={transactionHash === ""}
                onClick={async () => {
                  setSelectedDepositMethod(
                    selectedWalletType?.value,
                    userDepositAddress?.network
                  );
                  sendTransactionHash();
                  if (contractType === "NO_PERMIT")
                    unlockAddress(userDepositAddress.address);
                }}
                size="lg"
                type="button"
              >
                {t("Deposit")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export const DepositAddress = memo(DepositAddressBase);

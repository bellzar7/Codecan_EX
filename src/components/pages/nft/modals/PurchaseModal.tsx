/* eslint-disable react/no-unescaped-entities */
"use client";
import { Icon } from "@iconify/react";
import type React from "react";
import { useEffect } from "react";
import Button from "@/components/elements/base/button/Button";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import ButtonLink from "@/components/elements/base/button-link/ButtonLink";
import IconBox from "@/components/elements/base/iconbox/IconBox";
import { useWalletStore } from "@/stores/user/wallet"; // Import the wallet store

interface PurchaseModalProps {
  isVisible: boolean;
  onClose: () => void;
  asset: NftAsset;
  chain: string;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isVisible,
  onClose,
  asset,
  chain,
}) => {
  const { wallet, fetchWallet } = useWalletStore(); // Access wallet state and actions

  // Fetch wallet information based on the asset's wallet type and currency
  useEffect(() => {
    if (isVisible && !wallet) {
      fetchWallet("ECO", chain);
    }
  }, [isVisible, wallet, fetchWallet]);

  // Handle background blur effect when the modal is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs transition-all duration-300 ease-in-out">
      {/* Modal Container */}
      <div className="relative w-[500px] rounded-xl border border-gray-100 bg-white p-8 shadow-2xl transition-all duration-300 ease-in-out dark:border-muted-700 dark:bg-muted-800">
        {/* Close Button */}
        <div className="absolute top-4 right-4">
          <IconButton color="muted" onClick={onClose}>
            <Icon
              className="text-gray-500 transition duration-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              icon="mdi:close"
            />
          </IconButton>
        </div>

        {/* Modal Content */}
        <h3 className="mb-2 text-center font-bold text-2xl text-muted-900 dark:text-white">
          Pay with Crypto
        </h3>
        <p className="mb-6 text-center text-muted-600 text-sm dark:text-muted-400">
          Complete your purchase of <strong>{asset.name}</strong>.
        </p>

        {/* Payment Amount */}
        <div className="mb-6 flex items-center justify-center">
          <IconBox
            color="primary"
            icon="solar:wallet-bold-duotone"
            mask="hexed"
            shape="straight"
            size="xl"
            variant="pastel"
          />
        </div>

        <div className="text-center">
          <div className="mb-2 text-muted-600 text-sm dark:text-muted-400">
            Payment Amount
          </div>
          <div className="mb-2 font-bold text-3xl text-muted-900 dark:text-white">
            {asset.price} {chain}
          </div>
        </div>

        <div className="my-6 rounded-lg bg-muted-100 p-6 text-center dark:bg-muted-900">
          {/* Wallet Balance */}
          {wallet ? (
            <div className="font-medium text-muted-600 text-sm dark:text-muted-400">
              Wallet Balance: {wallet.balance} {wallet.currency}
            </div>
          ) : (
            <div className="font-medium text-muted-600 text-sm dark:text-muted-400">
              Wallet Balance: 0 {chain}
            </div>
          )}

          {/* Warning Message */}
          {(wallet && wallet.balance < asset.price) ||
            (!wallet && (
              <p className="mt-2 font-medium text-red-500 text-sm">
                You don't have enough crypto in your wallet.
              </p>
            ))}
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-between gap-4">
          <div className="w-1/2">
            <Button className="w-full" color={"muted"} onClick={onClose}>
              Back
            </Button>
          </div>
          <div className="w-1/2">
            {wallet && wallet.balance >= asset.price ? (
              <Button
                className="w-full"
                color={"primary"}
                disabled={!wallet || wallet.balance < asset.price}
              >
                Buy Now
              </Button>
            ) : (
              <ButtonLink
                className="w-full"
                color={"primary"}
                href="/user/wallet/deposit"
              >
                Deposit Now
              </ButtonLink>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;

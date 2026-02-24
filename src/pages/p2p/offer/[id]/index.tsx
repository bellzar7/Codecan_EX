"use client";
import { Icon } from "@iconify/react";
import { formatDate } from "date-fns";
import { debounce } from "lodash";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import Avatar from "@/components/elements/base/avatar/Avatar";
import { BackButton } from "@/components/elements/base/button/BackButton";
import Button from "@/components/elements/base/button/Button";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import Card from "@/components/elements/base/card/Card";
import InfoBlock from "@/components/elements/base/infoBlock";
import Modal from "@/components/elements/base/modal/Modal";
import Input from "@/components/elements/form/input/Input";
import Select from "@/components/elements/form/select/Select";
import { MashImage } from "@/components/elements/MashImage";
import { DealCard } from "@/components/pages/p2p/DealCard";
import Layout from "@/layouts/Default";
import { useDashboardStore } from "@/stores/dashboard";
import { useWalletStore } from "@/stores/user/wallet";
import $fetch from "@/utils/api";

type P2pOfferType = {
  id: string;
  userId: string;
  avatarToDisplay: string | null;
  paymentMethodId: string;
  walletType: string;
  currency: string;
  chain: string;
  amount: number;
  minAmount: number;
  maxAmount: number;
  inOrder: number;
  price: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  additionalPaymentMethodIds: any[];
  p2pTrades: {
    id: string;
    status: string;
    amount: number;
  }[];
  user: {
    firstName: string;
    lastName: string;
    avatar: string;
  };
  paymentMethod: {
    id: string;
    userId: string;
    name: string;
    instructions: string;
    currency: string;
    chain?: string;
    walletType: string;
    image: string | null;
    status: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
  p2pReviews: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    reviewer: {
      firstName: string;
      lastName: string;
      avatar: string;
      id: string;
    };
  }[];
};
const P2pOffer: React.FC = () => {
  const { t } = useTranslation();
  const { profile } = useDashboardStore();
  const [isLoading, setIsLoading] = useState(false);
  const { wallet, fetchWallet } = useWalletStore();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [paymentMethods, setAvailablePaymentMethods] = useState<string[]>([]);
  const [offer, setOffer] = useState<P2pOfferType | null>(null);
  const router = useRouter();

  const { id } = router.query as {
    id: string;
  };

  const fetchOffer = async () => {
    setIsLoading(true);
    const { data, error } = await $fetch({
      url: `/api/ext/p2p/offer/${id}`,
      silent: true,
    });
    if (!error) {
      const offerData = data as any;
      setOffer(offerData);
      let filteredPaymentMethods = [] as any;
      if (offerData?.additionalPaymentMethodIds?.length > 0) {
        filteredPaymentMethods = offerData.additionalPaymentMethodIds.map(
          (method: { id: string; name: string }) => ({
            value: method.id,
            label: method.name,
          })
        );
        const exists = filteredPaymentMethods.some(
          (item) => item.value == offerData.paymentMethodId
        );
        if (!exists) {
          filteredPaymentMethods.push({
            value: offerData.paymentMethod.id,
            label: offerData.paymentMethod.name,
          });
        }
      } else {
        filteredPaymentMethods.push({
          value: offerData.paymentMethod.id,
          label: offerData.paymentMethod.name,
        });
      }
      setAvailablePaymentMethods(filteredPaymentMethods);
      if (filteredPaymentMethods?.length > 0) {
        setPaymentMethod(filteredPaymentMethods[0]?.value);
      }
    }
    setIsLoading(false);
  };
  const debounceFetchOffer = debounce(fetchOffer, 100);

  useEffect(() => {
    if (router.isReady && id) {
      debounceFetchOffer();
    }
  }, [router.isReady, id]);

  useEffect(() => {
    if (offer && !wallet) {
      fetchWallet(offer.paymentMethod.walletType, offer.paymentMethod.currency);
    }
  }, [offer, wallet]);

  const offerProgress = useMemo(() => {
    if (!offer) return 0;
    return Number((offer.inOrder / offer.amount) * 100).toFixed(2);
  }, [offer]);

  const trade = async () => {
    setIsLoading(true);
    if (offer) {
      const { data, error } = await $fetch({
        url: "/api/ext/p2p/trade",
        method: "POST",
        body: {
          offerId: offer.id,
          paymentMethodId: paymentMethod,
          amount,
        },
      });
      if (!error) {
        router.push(`/user/p2p/trade/${(data as any).id}`);
      }
    }
    setIsLoading(false);
  };

  return (
    <Layout color="muted" title={t("P2P Offer")}>
      <main className="p-6">
        <div className="mb-6 flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="contact flex w-full flex-row items-center justify-center gap-3 sm:justify-start">
            <div className="relative">
              <Avatar
                size="md"
                src={`/img/crypto/${offer?.currency.toLowerCase()}.webp`}
              />
              {offer?.chain && (
                <MashImage
                  alt="chain"
                  className="absolute right-0 bottom-0"
                  height={16}
                  src={`/img/crypto/${offer.chain}.webp`}
                  width={16}
                />
              )}
            </div>
            <div className="text-start font-sans">
              <h4 className="font-medium text-base text-muted-800 leading-tight dark:text-muted-100">
                {offer?.currency} {offer?.chain && `(${offer.chain})`}
              </h4>
              <p className="font-sans text-muted-400 text-xs">
                {offer?.createdAt
                  ? formatDate(new Date(offer.createdAt), "dd MMM yyyy")
                  : ""}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <BackButton href={"/p2p"} />
            {profile?.id !== offer?.userId && (
              <Button
                color="primary"
                disabled={
                  offer?.status !== "ACTIVE" ||
                  (offer ? offer.inOrder >= offer.amount : false)
                }
                onClick={() => {
                  setOpen(true);
                }}
                shape={"rounded-sm"}
                type="button"
              >
                {t("Trade")}
              </Button>
            )}
          </div>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <div className="w-1/2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-muted-400 text-xs">
                {t("Traded Amount")}
              </span>
              <span className="font-medium text-muted-400 text-xs">
                {offerProgress}%
              </span>
            </div>
            <div className="h-1 rounded-full bg-muted-200 dark:bg-muted-800">
              <div
                className="h-1 rounded-full bg-primary-500 dark:bg-primary-400"
                style={{ width: `${offerProgress}%` }}
              />
            </div>
          </div>
          <div className="w-1/2 text-right">
            <span className="font-medium text-muted-400 text-xs">
              {t("Offer ID")} {offer?.id}
            </span>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="col-span-1 flex flex-col gap-6">
            <div className="col-span-1">
              <DealCard isToggle title={t("Payment Method")}>
                <InfoBlock
                  icon="bx:bx-wallet"
                  label={t("Method")}
                  value={offer?.paymentMethod.name}
                />
                <InfoBlock
                  icon="bx:bx-wallet"
                  label={t("Wallet Type")}
                  value={offer?.paymentMethod.walletType}
                />
                <InfoBlock
                  icon="bx:bx-dollar"
                  label={t("Currency")}
                  value={offer?.paymentMethod.currency}
                />
                {offer?.paymentMethod.chain && (
                  <InfoBlock
                    icon="bx:bx-coin-stack"
                    label={t("Chain")}
                    value={offer?.paymentMethod.chain}
                  />
                )}
              </DealCard>
            </div>
            {offer && offer?.additionalPaymentMethodIds?.length > 0 && (
              <div className="col-span-1">
                <DealCard isToggle title={t("Additional Payment Methods")}>
                  {offer?.additionalPaymentMethodIds.map(
                    (additionalPaymentMethodId, key) => (
                      <div className="flex gap-4" key={key}>
                        <InfoBlock
                          icon="bx:bx-wallet"
                          label={t("Method")}
                          value={additionalPaymentMethodId?.name}
                        />
                        <InfoBlock
                          icon="bx:bx-wallet"
                          label={t("Wallet Type")}
                          value={additionalPaymentMethodId?.walletType}
                        />
                        <InfoBlock
                          icon="bx:bx-dollar"
                          label={t("Currency")}
                          value={additionalPaymentMethodId?.currency}
                        />
                        {additionalPaymentMethodId?.chain && (
                          <InfoBlock
                            icon="bx:bx-coin-stack"
                            label={t("Chain")}
                            value={additionalPaymentMethodId?.chain}
                          />
                        )}
                      </div>
                    )
                  )}
                </DealCard>
              </div>
            )}

            <div className="col-span-1">
              <DealCard isToggle title={t("Offer Information")}>
                <InfoBlock
                  icon="bx:bx-wallet"
                  label={t("Wallet Type")}
                  value={offer?.walletType}
                />
                {offer?.chain && (
                  <InfoBlock
                    icon="bx:bx-coin-stack"
                    label={t("Chain")}
                    value={offer.chain}
                  />
                )}

                <InfoBlock
                  icon="bx:bx-dollar"
                  label={t("Currency")}
                  value={offer?.currency}
                />
                <InfoBlock
                  icon="bx:bx-money"
                  label={t("Price")}
                  value={`${offer?.price} ${offer?.paymentMethod?.currency}`}
                />
                <InfoBlock
                  icon="bx:bx-money"
                  label={t("Remaining Amount")}
                  value={`${offer && offer?.amount - offer?.inOrder} ${
                    offer?.currency
                  }`}
                />
              </DealCard>
            </div>
          </div>
          <div className="col-span-1">
            {offer && (
              <DealCard isToggle title={t("Recent Trades")}>
                <div className="flex flex-col gap-4">
                  {offer?.p2pTrades.slice(0, 5).map((trade) => (
                    <Card
                      className="flex items-center justify-between gap-4 p-3"
                      key={trade.id}
                    >
                      <div className="flex items-center gap-3">
                        <MashImage
                          alt="Deal image"
                          className="rounded-full"
                          height={32}
                          src={
                            offer?.avatarToDisplay
                              ? offer?.avatarToDisplay
                              : offer?.user?.avatar || "/img/placeholder.svg"
                          }
                          width={32}
                        />
                        <div className="font-sans">
                          <span className="block font-medium text-muted-800 text-sm dark:text-muted-100">
                            {offer?.user.firstName}
                          </span>
                          <span className="block text-muted-400 text-xs">
                            {offer?.user.lastName}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-medium text-muted-400 text-xs">
                          {trade.status}
                        </span>
                        <span className="font-medium text-muted-400 text-xs">
                          {trade.amount} {offer?.currency}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </DealCard>
            )}
          </div>
          {/* reviews */}
          <div className="col-span-1">
            {offer && (
              <DealCard isToggle title={t("Recent Reviews")}>
                <div className="flex flex-col gap-4">
                  {offer.p2pReviews.slice(0, 5).map(
                    (review) =>
                      profile?.id !== review?.reviewer?.id && (
                        <Card className="p-3" key={review.id}>
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <MashImage
                                alt="Deal image"
                                className="rounded-full"
                                height={32}
                                src={
                                  review.reviewer.avatar ||
                                  "/img/placeholder.svg"
                                }
                                width={32}
                              />
                              <div className="font-sans">
                                <span className="block font-medium text-muted-800 text-sm dark:text-muted-100">
                                  {review.reviewer.firstName}
                                </span>
                                <span className="block text-muted-400 text-xs">
                                  {review.reviewer.lastName}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="flex gap-1">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Icon
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                    icon={
                                      i < review.rating
                                        ? "uim:star"
                                        : i === review.rating &&
                                            review.rating % 1 >= 0.5
                                          ? "uim:star-half-alt"
                                          : "uim:star"
                                    }
                                    key={i}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          <span className="font-medium text-muted-400 text-xs">
                            {review.comment}
                          </span>
                        </Card>
                      )
                  )}
                </div>
              </DealCard>
            )}
          </div>
        </div>

        <Modal open={open} size="sm">
          <Card shape="smooth">
            <div className="flex items-center justify-between p-4 md:p-6">
              <p className="font-medium font-sans text-lg text-muted-900 dark:text-white">
                {t("Trade Details")}
              </p>
              <IconButton
                onClick={() => {
                  setOpen(false);
                }}
                shape="full"
                size="sm"
              >
                <Icon className="h-4 w-4" icon="lucide:x" />
              </IconButton>
            </div>
            <div className="p-4 md:px-6 md:py-8">
              <div className="mx-auto w-full max-w-xs">
                <p className="text-muted-500 text-sm dark:text-muted-400">
                  {t(
                    "Please enter the amount you would like to trade with the user"
                  )}
                </p>
                <Input
                  label={t("Amount in") + " " + offer?.currency}
                  max={wallet ? wallet.balance : offer?.maxAmount}
                  min={offer?.minAmount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder={t("Enter Amount")}
                  type="number"
                  value={amount}
                />

                <Select
                  label={t("Select payment method")}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  options={paymentMethods}
                  value={paymentMethod as any}
                />
                {/* Calculated equivalent in the currency */}
                {amount > 0 && (
                  <div className="mt-2 text-muted-500 text-sm dark:text-muted-400">
                    {t("Equivalent in") + " " + offer?.paymentMethod.currency}:{" "}
                    <span className="font-medium text-muted-700 dark:text-muted-200">
                      {(amount * (offer?.price || 0)).toFixed(2)}{" "}
                      {offer?.paymentMethod.currency}
                    </span>
                  </div>
                )}
              </div>
              {/* Minimum and Maximum Trade Amount */}
              <Card className="mt-6 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-500 text-sm dark:text-muted-400">
                    {t("Minimum Trade Amount")}
                  </span>
                  <span className="text-muted-500 text-sm dark:text-muted-400">
                    {offer?.minAmount} {offer?.currency}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-500 text-sm dark:text-muted-400">
                    {t("Maximum Trade Amount")}
                  </span>
                  <span className="text-muted-500 text-sm dark:text-muted-400">
                    {offer?.maxAmount} {offer?.currency}
                  </span>
                </div>
              </Card>
              {/* Wallet Balance */}
              <Card className="mt-6 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-500 text-sm dark:text-muted-400">
                    {t("Wallet Balance")}
                  </span>
                  <span className="text-muted-500 text-sm dark:text-muted-400">
                    {wallet ? wallet.balance : 0}{" "}
                    {offer?.paymentMethod?.currency}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-500 text-sm dark:text-muted-400">
                    {t("Remaining Balance")}
                  </span>
                  <span className="text-muted-500 text-sm dark:text-muted-400">
                    {wallet ? wallet.balance - amount : 0}{" "}
                    {offer?.paymentMethod?.currency}
                  </span>
                </div>
              </Card>
            </div>
            <div className="p-4 md:p-6">
              <div className="flex w-full justify-end gap-2">
                <Button
                  onClick={() => {
                    setOpen(false);
                  }}
                  shape="smooth"
                >
                  {t("Cancel")}
                </Button>
                <Button
                  color="primary"
                  disabled={
                    isLoading ||
                    amount <= 0 ||
                    (offer ? amount > offer.amount - offer.inOrder : false) ||
                    (wallet ? amount > wallet.balance : false)
                  }
                  loading={isLoading}
                  onClick={trade}
                  shape="smooth"
                  variant="solid"
                >
                  {t("Trade")}
                </Button>
              </div>
            </div>
          </Card>
        </Modal>
      </main>
    </Layout>
  );
};
export default P2pOffer;

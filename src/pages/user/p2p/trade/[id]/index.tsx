import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import Alert from "@/components/elements/base/alert/Alert";
import Avatar from "@/components/elements/base/avatar/Avatar";
import Button from "@/components/elements/base/button/Button";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import Card from "@/components/elements/base/card/Card";
import Modal from "@/components/elements/base/modal/Modal";
import { PageHeader } from "@/components/elements/base/page-header";
import Textarea from "@/components/elements/form/textarea/Textarea";
import { Chat } from "@/components/pages/user/Chat";
import { TradeInfo } from "@/components/pages/user/p2p/TradeInfo";
import Layout from "@/layouts/Default";
import { useDashboardStore } from "@/stores/dashboard";
import useP2PStore from "@/stores/user/p2p/trade";

const TradeDetails = () => {
  const { t } = useTranslation();
  const { profile } = useDashboardStore();
  const {
    trade,
    initializeWebSocket,
    disconnectWebSocket,
    setIsSeller,
    isSeller,
    handleFileUpload,
    isReplying,
    replyToTrade,
    fetchTrade,
    cancelTrade,
    markAsPaidTrade,
    disputeTrade,
    cancelDisputeTrade,
    releaseTrade,
    refundTrade,
    submitReview,
    reviewRating,
    setReviewRating,
    hoverRating,
    setHoverRating,
    comment,
    setComment,
  } = useP2PStore();
  const [isCancellingOpen, setIsCancellingOpen] = useState(false);
  const [isPayingOpen, setIsPayingOpen] = useState(false);
  const [isDisputingOpen, setIsDisputingOpen] = useState(false);
  const [isCancelDisputeOpen, setIsCancelDisputeOpen] = useState(false);
  const [isReleasingOpen, setIsReleasingOpen] = useState(false);
  const [isRefundingOpen, setIsRefundingOpen] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isReviewingOpen, setIsReviewingOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { id } = router.query as {
    id: string;
  };
  useEffect(() => {
    if (!(router.isReady && profile)) return;
    fetchTrade(id);
    initializeWebSocket(profile.id, id);
    return () => {
      disconnectWebSocket();
    };
  }, [router.isReady, profile]);
  useEffect(() => {
    if (!trade) return;
    setIsSeller(trade.seller.id === profile?.id);
    setHasReviewed(
      trade.offer.p2pReviews.some(
        (review) => review.reviewer.id === profile?.id
      )
    );
  }, [trade]);
  const messageSide = (userId) => {
    return userId === profile?.id ? "left" : "right";
  };
  if (!trade) return null;

  const renderDisputeMessage = () => {
    if (trade.status === "DISPUTE_OPEN") {
      return (
        <div className="w-full">
          {trade.p2pDisputes[0]?.status === "PENDING" && (
            <div className="px-5 pb-5">
              <Alert className="w-full text-sm" color="warning">
                {t("Trade is in dispute, please wait until it is reviewed.")}
              </Alert>
            </div>
          )}
          {trade.p2pDisputes[0]?.status === "IN_PROGRESS" && (
            <div className="px-5 pb-5">
              <Alert className="w-full text-sm" color="warning">
                {trade.p2pDisputes[0]?.resolution}
              </Alert>
            </div>
          )}
        </div>
      );
    }
  };

  const renderButtons = () => {
    const buttons: JSX.Element[] = [];
    if (trade.status === "PENDING") {
      buttons.push(
        <div className="w-full" key="cancel-trade">
          <Button
            className="w-full"
            color="danger"
            onClick={() => setIsCancellingOpen(true)}
            variant="solid"
          >
            {t("Cancel Trade")}
          </Button>
        </div>
      );
      if (!isSeller) {
        buttons.push(
          <div className="w-full" key="pay-trade">
            <Button
              className="w-full"
              color="success"
              onClick={() => setIsPayingOpen(true)}
              variant="solid"
            >
              {t("Submit")}
            </Button>
          </div>
        );
      }
    }
    if (trade.status === "PAID" && !trade.p2pDisputes.length) {
      buttons.push(
        <div className="w-full" key="dispute-trade">
          <Button
            className="w-full"
            color="warning"
            onClick={() => setIsDisputingOpen(true)}
            variant="solid"
          >
            {t("Dispute Trade")}
          </Button>
        </div>
      );
    }
    if (
      trade.status === "DISPUTE_OPEN" &&
      trade.p2pDisputes[0]?.status === "PENDING" &&
      trade.p2pDisputes[0]?.raisedBy?.id === profile?.id
    ) {
      buttons.push(
        <div className="w-full" key="cancel-dispute">
          <Button
            className="w-full"
            color="warning"
            onClick={() => setIsCancelDisputeOpen(true)}
            variant="solid"
          >
            {t("Cancel Dispute")}
          </Button>
        </div>
      );
    }
    if (isSeller && ["DISPUTE_OPEN", "PAID"].includes(trade.status)) {
      buttons.push(
        <div className="w-full" key="release-trade">
          <Button
            className="w-full"
            color="primary"
            onClick={() => setIsReleasingOpen(true)}
            variant="solid"
          >
            {t("Release Trade")}
          </Button>
        </div>
      );
    }
    if (!isSeller && ["COMPLETED"].includes(trade.status) && !hasReviewed) {
      buttons.push(
        <div className="w-full" key="review-offer">
          <Button
            className="w-full"
            color="warning"
            onClick={() => setIsReviewingOpen(true)}
            variant="solid"
          >
            {t("Review Offer")}
          </Button>
        </div>
      );
    }
    return buttons;
  };

  const hasButtons = renderButtons().length > 0;

  const ClientInfoCard = () => {
    const client = isSeller ? trade.user : trade.seller;
    const role = isSeller ? t("Buyer") : t("Seller");
    const { offer } = trade;

    // Calculate average rating
    const averageRating =
      offer.p2pReviews.length > 0
        ? (
            offer.p2pReviews.reduce((acc, review) => acc + review.rating, 0) /
            offer.p2pReviews.length
          ).toFixed(1)
        : t("No Ratings");

    const totalReviews = offer.p2pReviews.length;

    return (
      <Card className="my-5 p-6">
        <div className="flex items-start gap-4">
          {/* Client Info */}
          <Avatar
            className="rounded-full"
            size="lg"
            src={client.avatar || "/img/placeholder.svg"}
          />
          <div className="flex-1">
            <h2 className="font-bold text-muted-900 text-xl dark:text-muted-100">
              {client.firstName} {client.lastName}
            </h2>
            <p className="text-muted-500 text-sm dark:text-muted-400">{role}</p>
            <p className="text-muted-500 text-sm dark:text-muted-400">
              {t("Email")}: {client.email}
            </p>
          </div>
          {!isSeller && (
            <>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="block text-muted-500 text-sm dark:text-muted-400">
                    {t("Average Rating")}
                  </span>
                  <span className="block text-muted-900 text-sm dark:text-muted-100">
                    {averageRating}
                  </span>
                </div>
                <div>
                  <span className="block text-muted-500 text-sm dark:text-muted-400">
                    {t("Total Reviews")}
                  </span>
                  <span className="block text-muted-900 text-sm dark:text-muted-100">
                    {totalReviews}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    );
  };

  return (
    <Layout color="muted" title={t("Trade Details")}>
      <PageHeader BackPath="/user/p2p/trade" title={`Trade #${trade.id}`} />
      <ClientInfoCard />
      <div className="mt-4 grid grid-cols-1 ltablet:grid-cols-12 gap-5 lg:grid-cols-12">
        <div className="order-last col-span-1 ltablet:col-span-8 md:order-1 lg:col-span-8">
          <Chat
            canReply={
              !["CANCELLED", "COMPLETED", "REFUNDED"].includes(trade.status)
            }
            handleFileUpload={handleFileUpload}
            isReplying={isReplying}
            messageSide={messageSide}
            messages={trade.messages || []}
            reply={replyToTrade}
            user1={trade.user}
            user2={trade.seller}
          />
        </div>
        <div className="col-span-1 ltablet:col-span-4 lg:col-span-4">
          <div className="relative">
            <Card color="contrast" shape="smooth">
              <TradeInfo />
              {renderDisputeMessage()}
              {trade.status !== "CLOSED" && hasButtons && (
                <div className="border-muted-200 border-t-2 border-dashed p-6 dark:border-muted-800">
                  <div className="flex flex-col items-center justify-center gap-2">
                    {renderButtons()}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal open={isCancellingOpen} size="sm">
        <Card shape="smooth">
          <div className="flex items-center justify-between p-4 md:p-6">
            <p className="font-medium font-sans text-lg text-muted-900 dark:text-white">
              {t("Cancel Trade")}
            </p>

            <IconButton
              onClick={() => setIsCancellingOpen(false)}
              shape="full"
              size="sm"
            >
              <Icon className="h-4 w-4" icon="lucide:x" />
            </IconButton>
          </div>
          <div className="p-4 md:p-6">
            <p className="text-muted-500 text-sm dark:text-muted-400">
              {t(
                "Are you sure you want to cancel the trade? This action cannot be undone."
              )}
            </p>
          </div>
          <div className="p-4 md:p-6">
            <div className="flex justify-end gap-x-2">
              <Button
                color="danger"
                onClick={async () => {
                  await cancelTrade();
                  setIsCancellingOpen(false);
                }}
              >
                {t("Submit")}
              </Button>
            </div>
          </div>
        </Card>
      </Modal>

      <Modal open={isPayingOpen} size="sm">
        <Card className={"w-max"} shape="smooth">
          <div className="flex items-center justify-between p-4 md:p-6">
            <p className="font-medium font-sans text-lg text-muted-900 dark:text-white">
              {t("Confirm Transaction")}
            </p>
            <IconButton
              onClick={() => setIsPayingOpen(false)}
              shape="full"
              size="sm"
            >
              <Icon className="h-4 w-4" icon="lucide:x" />
            </IconButton>
          </div>
          <div className="p-4 md:p-6">
            <div className="mx-auto max-w-xl rounded-lg border-yellow-500 border-l-4 bg-zinc-800 p-5 font-sans text-yellow-100 shadow-md">
              <div className="mr-2 mb-3 ml-2 text-3xl">⚠️</div>
              <h2 className="mb-2 font-semibold text-lg text-yellow-200">
                Warning! Payment Confirmation Without Transfer
              </h2>
              <p className="mb-3 text-base text-yellow-100">
                You have clicked <strong>“I have paid”</strong>, but the seller
                has not received the funds yet.
              </p>
              <ul className="list-inside list-disc space-y-1 pl-2 text-base text-yellow-100">
                <li>
                  This is <strong>not</strong> a confirmation of actual payment.
                </li>
                <li>
                  Clicking without transferring funds is considered{" "}
                  <strong>fraudulent behavior</strong>.
                </li>
              </ul>
              <div className="mt-3">
                <p className="mb-1 font-semibold text-yellow-200">
                  What may happen:
                </p>
                <ul className="list-inside list-disc space-y-1 pl-2 text-base text-yellow-100">
                  <li>
                    Your account may be <strong>blocked</strong>
                  </li>
                  <li>
                    We may report the incident to{" "}
                    <strong>law enforcement authorities</strong>
                  </li>
                </ul>
              </div>
              <p className="mt-4 font-semibold text-yellow-60">
                Click “Submit” only after completing the real transfer.
              </p>
            </div>

            {/*<Input*/}
            {/*  value={txHash}*/}
            {/*  onChange={(e) => setTxHash(e.target.value)}*/}
            {/*  shape="curved"*/}
            {/*  placeholder={t("Transaction Hash")}*/}
            {/*  label={t("Transaction Hash")}*/}
            {/*/>*/}
          </div>
          <div className="p-4 md:p-6">
            <div className="flex justify-end gap-x-2">
              <Button
                color="success"
                onClick={async () => {
                  await markAsPaidTrade(txHash);
                  setIsPayingOpen(false);
                  setTxHash("");
                }}
              >
                {t("Submit")}
              </Button>
            </div>
          </div>
        </Card>
      </Modal>

      <Modal open={isDisputingOpen} size="sm">
        <Card shape="smooth">
          <div className="flex items-center justify-between p-4 md:p-6">
            <p className="font-medium font-sans text-lg text-muted-900 dark:text-white">
              {t("Dispute Trade")}
            </p>
            <IconButton
              onClick={() => setIsDisputingOpen(false)}
              shape="full"
              size="sm"
            >
              <Icon className="h-4 w-4" icon="lucide:x" />
            </IconButton>
          </div>
          <div className="p-4 md:p-6">
            <span className="text-muted-400 dark:text-muted-600">
              {t(
                "Please enter the reason for the dispute, we will review it and get back to you."
              )}
            </span>
            <Textarea
              label={t("Reason")}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder={t("Reason")}
              shape="curved"
              value={disputeReason}
            />
          </div>
          <div className="p-4 md:p-6">
            <div className="flex justify-end gap-x-2">
              <Button
                color="warning"
                onClick={async () => {
                  await disputeTrade(disputeReason);
                  setIsDisputingOpen(false);
                  setDisputeReason("");
                }}
              >
                {t("Submit")}
              </Button>
            </div>
          </div>
        </Card>
      </Modal>

      <Modal open={isCancelDisputeOpen} size="sm">
        <Card shape="smooth">
          <div className="flex items-center justify-between p-4 md:p-6">
            <p className="font-medium font-sans text-lg text-muted-900 dark:text-white">
              {t("Cancel Dispute")}
            </p>
            <IconButton
              onClick={() => setIsCancelDisputeOpen(false)}
              shape="full"
              size="sm"
            >
              <Icon className="h-4 w-4" icon="lucide:x" />
            </IconButton>
          </div>
          <div className="p-4 md:p-6">
            <p className="text-muted-500 text-sm dark:text-muted-400">
              {t(
                "Are you sure you want to cancel the dispute? This action cannot be undone, and you will not be able to open a dispute again."
              )}
            </p>
          </div>
          <div className="p-4 md:p-6">
            <div className="flex justify-end gap-x-2">
              <Button
                color="primary"
                onClick={async () => {
                  await cancelDisputeTrade();
                  setIsCancelDisputeOpen(false);
                }}
              >
                {t("Close Dispute")}
              </Button>
            </div>
          </div>
        </Card>
      </Modal>

      <Modal open={isReleasingOpen} size="sm">
        <Card shape="smooth">
          <div className="flex items-center justify-between p-4 md:p-6">
            <p className="font-medium font-sans text-lg text-muted-900 dark:text-white">
              {t("Release Funds")}
            </p>

            <IconButton
              onClick={() => setIsReleasingOpen(false)}
              shape="full"
              size="sm"
            >
              <Icon className="h-4 w-4" icon="lucide:x" />
            </IconButton>
          </div>
          <div className="p-4 md:p-6">
            <p className="text-muted-500 text-sm dark:text-muted-400">
              {t(
                "Are you sure you want to release the funds? This action cannot be undone."
              )}
            </p>
          </div>
          <div className="p-4 md:p-6">
            <div className="flex justify-end gap-x-2">
              <Button
                color="primary"
                onClick={async () => {
                  await releaseTrade();
                  setIsReleasingOpen(false);
                }}
              >
                {t("Submit")}
              </Button>
            </div>
          </div>
        </Card>
      </Modal>

      <Modal open={isRefundingOpen} size="sm">
        <Card shape="smooth">
          <div className="flex items-center justify-between p-4 md:p-6">
            <p className="font-medium font-sans text-lg text-muted-900 dark:text-white">
              {t("Refund Funds")}
            </p>

            <IconButton
              onClick={() => setIsRefundingOpen(false)}
              shape="full"
              size="sm"
            >
              <Icon className="h-4 w-4" icon="lucide:x" />
            </IconButton>
          </div>
          <div className="p-4 md:p-6">
            <p className="text-muted-500 text-sm dark:text-muted-400">
              {t(
                "Are you sure you want to refund the funds? This action cannot be undone."
              )}
            </p>
          </div>
          <div className="p-4 md:p-6">
            <div className="flex justify-end gap-x-2">
              <Button
                color="primary"
                onClick={async () => {
                  await refundTrade();
                  setIsRefundingOpen(false);
                }}
              >
                {t("Submit")}
              </Button>
            </div>
          </div>
        </Card>
      </Modal>

      <Modal open={isReviewingOpen} size="sm">
        <Card shape="smooth">
          <div className="flex items-center justify-between p-4 md:p-6">
            <p className="font-medium font-sans text-lg text-muted-900 dark:text-white">
              {t("Review Offer")}
            </p>

            <IconButton
              onClick={() => setIsReviewingOpen(false)}
              shape="full"
              size="sm"
            >
              <Icon className="h-4 w-4" icon="lucide:x" />
            </IconButton>
          </div>
          <div className="p-4 md:p-6">
            <p className="text-muted-500 text-sm dark:text-muted-400">
              {t("Please leave a review for the offer.")}
            </p>

            <div className="flex gap-2">
              {Array.from({ length: 5 }, (_, i) => (
                <Icon
                  className={`h-5 w-5 ${
                    i < (hoverRating || reviewRating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`} // Add key here
                  icon="uim:star"
                  key={i}
                  onClick={() => setReviewRating(i + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                  onMouseOver={() => setHoverRating(i + 1)}
                />
              ))}
            </div>
            <div className="space-y-5">
              <Textarea
                label={t("Message")}
                name="comment"
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("Write your message...")}
                value={comment}
              />
            </div>
          </div>
          <div className="p-4 md:p-6">
            <div className="flex justify-end gap-x-2">
              <Button
                color="primary"
                disabled={isSubmitting}
                loading={isSubmitting}
                onClick={async () => {
                  setIsSubmitting(true);
                  submitReview();
                  setIsReviewingOpen(false);
                  setIsSubmitting(false);
                }}
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
export default TradeDetails;

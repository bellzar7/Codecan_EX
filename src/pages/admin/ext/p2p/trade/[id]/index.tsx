import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import Alert from "@/components/elements/base/alert/Alert";
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
    handleFileUpload,
    isReplying,
    replyToTrade,
    fetchTrade,
    adminResolveDispute,
    adminCloseDispute,
    adminCompleteTrade,
    adminCancelTrade,
  } = useP2PStore();
  const [isResolvingDispute, setIsResolvingDispute] = useState(false);
  const [isCancelDisputeOpen, setIsCancelDisputeOpen] = useState(false);
  const [isCancellingOpen, setIsCancellingOpen] = useState(false);
  const [isCompletingOpen, setIsCompletingOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
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
    if (
      ["DISPUTE_OPEN"].includes(trade?.status) &&
      ["PENDING", "IN_PROGRESS"].includes(trade.p2pDisputes[0]?.status)
    ) {
      buttons.push(
        <div className="w-full">
          <Button
            className="w-full"
            color="success"
            key="resolve-dispute"
            onClick={() =>
              adminResolveDispute(trade.p2pDisputes[0]?.resolution)
            }
            variant="solid"
          >
            {trade.p2pDisputes[0]?.resolution
              ? "Edit Resolution"
              : "Resolve Dispute"}
          </Button>
        </div>
      );
      buttons.push(
        <div className="w-full">
          <Button
            className="w-full"
            color="success"
            key="close-dispute"
            onClick={() => adminCloseDispute()}
            variant="solid"
          >
            {t("Close Dispute")}
          </Button>
        </div>
      );
    }
    if (["PENDING", "PAID", "DISPUTE_OPEN"].includes(trade?.status)) {
      buttons.push(
        <div className="w-full">
          <Button
            className="w-full"
            color="danger"
            key="cancel-trade"
            onClick={() => adminCancelTrade()}
            variant="solid"
          >
            {t("Cancel Trade")}
          </Button>
        </div>
      );
    }
    if (["DISPUTE_OPEN", "PAID"].includes(trade?.status)) {
      buttons.push(
        <div className="w-full">
          <Button
            className="w-full"
            color="success"
            key="release-trade"
            onClick={() => adminCompleteTrade()}
            variant="solid"
          >
            {t("Complete Trade")}
          </Button>
        </div>
      );
    }
    return buttons;
  };
  const hasButtons = renderButtons().length > 0;
  return (
    <Layout color="muted" horizontal={true} title={t("Trade Details")}>
      <div className="pe-4 pt-20">
        <PageHeader
          BackPath="/admin/ext/p2p/trade"
          title={`Trade #${trade.id}`}
        />
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
              user1={profile}
              user2={trade.seller || trade.user}
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
      </div>

      {/* admin modals */}
      <Modal open={isCancelDisputeOpen} size="sm">
        <Card shape="smooth">
          <div className="flex items-center justify-between p-4 md:p-6">
            <p className="font-medium font-sans text-lg text-muted-900 dark:text-white">
              {t("Resolve Dispute")}
            </p>
            <IconButton
              onClick={() => setIsResolvingDispute(false)}
              shape="full"
              size="sm"
            >
              <Icon className="h-4 w-4" icon="lucide:x" />
            </IconButton>
          </div>
          <div className="p-4 md:p-6">
            <span className="text-muted-400 dark:text-muted-600">
              {t("Please enter the resolution for the dispute.")}
            </span>
            <Textarea
              label={t("Resolution")}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder={t("Resolution")}
              shape="curved"
              value={disputeReason}
            />
          </div>
          <div className="p-4 md:p-6">
            <div className="flex justify-end gap-x-2">
              <Button
                color="warning"
                onClick={async () => {
                  await adminResolveDispute(disputeReason);
                  setIsResolvingDispute(false);
                  setDisputeReason("");
                }}
              >
                {t("Submit")}
              </Button>
            </div>
          </div>
        </Card>
      </Modal>

      {/* cancel dispute */}
      <Modal open={isCancellingOpen} size="sm">
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
            <span className="text-muted-400 dark:text-muted-600">
              {t("Are you sure you want to cancel the dispute")}
            </span>
          </div>
          <div className="p-4 md:p-6">
            <div className="flex justify-end gap-x-2">
              <Button
                color="warning"
                onClick={async () => {
                  await adminCancelTrade();
                  setIsCancelDisputeOpen(false);
                }}
              >
                {t("Confirm")}
              </Button>
            </div>
          </div>
        </Card>
      </Modal>

      <Modal open={isCompletingOpen} size="sm">
        <Card shape="smooth">
          <div className="flex items-center justify-between p-4 md:p-6">
            <p className="font-medium font-sans text-lg text-muted-900 dark:text-white">
              {t("Complete Trade")}
            </p>
            <IconButton
              onClick={() => setIsCompletingOpen(false)}
              shape="full"
              size="sm"
            >
              <Icon className="h-4 w-4" icon="lucide:x" />
            </IconButton>
          </div>
          <div className="p-4 md:p-6">
            <span className="text-muted-400 dark:text-muted-600">
              {t("Are you sure you want to release the trade")}
            </span>
          </div>
          <div className="p-4 md:p-6">
            <div className="flex justify-end gap-x-2">
              <Button
                color="warning"
                onClick={async () => {
                  await adminCompleteTrade();
                  setIsCompletingOpen(false);
                }}
              >
                {t("Confirm")}
              </Button>
            </div>
          </div>
        </Card>
      </Modal>

      <Modal open={isResolvingDispute} size="sm">
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
            <span className="text-muted-400 dark:text-muted-600">
              {t("Are you sure you want to cancel the trade")}
            </span>
          </div>
          <div className="p-4 md:p-6">
            <div className="flex justify-end gap-x-2">
              <Button
                color="warning"
                onClick={async () => {
                  await adminCancelTrade();
                  setIsCancellingOpen(false);
                }}
              >
                {t("Confirm")}
              </Button>
            </div>
          </div>
        </Card>
      </Modal>
    </Layout>
  );
};
export default TradeDetails;
export const permission = "Access P2P Trade Management";

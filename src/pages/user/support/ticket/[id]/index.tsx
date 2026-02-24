import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverContentClose,
  PopoverTrigger,
} from "@/components/elements/addons/popover/Popover";
import Button from "@/components/elements/base/button/Button";
import Card from "@/components/elements/base/card/Card";
import { PageHeader } from "@/components/elements/base/page-header";
import { Chat } from "@/components/pages/user/Chat";
import { TicketInformation } from "@/components/pages/user/support/TicketInformation";
import ListWidgetItem from "@/components/widgets/ListWidgetItem";
import Layout from "@/layouts/Default";
import { useDashboardStore } from "@/stores/dashboard";
import useTicketStore from "@/stores/user/support";

const TicketDetails = () => {
  const { t } = useTranslation();
  const { profile } = useDashboardStore();
  const {
    ticket,
    initializeWebSocket,
    disconnectWebSocket,
    fetchTicket,
    resolveTicket,
    setIsSupport,
    replyToTicket,
    handleFileUpload,
    isReplying,
  } = useTicketStore();

  const router = useRouter();
  const { id } = router.query;
  useEffect(() => {
    if (router.isReady) {
      setIsSupport(false);
      fetchTicket(id as string);
      initializeWebSocket(id as string);
      return () => {
        disconnectWebSocket();
      };
    }
  }, [router.isReady]);
  const messageSide = (userId) => {
    return userId === profile?.id ? "left" : "right";
  };
  return (
    <Layout color="muted" title={t("Ticket Details")}>
      <PageHeader
        BackPath="/user/support/ticket"
        title={ticket?.subject || "Loading..."}
      />
      <div className="mt-4 grid grid-cols-1 ltablet:grid-cols-12 gap-5 lg:grid-cols-12">
        <div className="order-last col-span-1 ltablet:col-span-8 md:order-1 lg:col-span-8">
          <Chat
            canReply={ticket?.status !== "CLOSED"}
            handleFileUpload={handleFileUpload}
            isReplying={isReplying}
            messageSide={messageSide}
            messages={ticket?.messages || []}
            reply={replyToTicket}
            user1={ticket?.user}
            user2={ticket?.agent}
          />
        </div>
        <div className="col-span-1 ltablet:col-span-4 lg:col-span-4">
          <div className="relative">
            <Card color="contrast" shape="smooth">
              <TicketInformation />
              <div className="p-6">
                <h4 className="mb-4 font-medium font-sans text-muted-500 text-xs uppercase">
                  {t("Supported by")}
                </h4>

                <ul className="inner-list">
                  <li>
                    <ListWidgetItem
                      avatar={
                        ticket?.agent?.avatar || "/img/avatars/placeholder.webp"
                      }
                      avatarSize="xxs"
                      href="#"
                      itemAction={<></>}
                      text="Support Agent"
                      title={
                        ticket?.agent
                          ? `${ticket?.agent?.firstName} ${ticket?.agent?.lastName}`
                          : "No agent assigned"
                      }
                    />
                  </li>
                </ul>
              </div>
              {ticket?.status !== "CLOSED" && ticket?.type !== "LIVE" && (
                <div className="border-muted-200 border-t-2 border-dashed p-6 dark:border-muted-800">
                  <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
                    <Popover placement="top">
                      <PopoverTrigger>
                        <Button
                          className="w-full"
                          color="danger"
                          variant="solid"
                        >
                          {t("Close Ticket")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="relative z-50 flex w-72 gap-2 rounded-lg border border-muted-200 bg-white p-4 shadow-muted-300/30 shadow-xl dark:border-muted-700 dark:bg-muted-800 dark:shadow-muted-800/20">
                        <div className="flex w-full flex-col gap-2">
                          <h4 className="font-medium font-sans text-muted-500 text-xs uppercase">
                            {ticket?.status === "OPEN"
                              ? "Close Ticket"
                              : "Reopen Ticket"}
                          </h4>
                          <p className="text-muted-400 text-xs">
                            {ticket?.status === "OPEN"
                              ? "Are you sure you want to close this ticket?"
                              : "Are you sure you want to reopen this ticket?"}
                          </p>
                          <div className="flex gap-2">
                            <PopoverContentClose>
                              <Button
                                className="w-full"
                                color="success"
                                onClick={() =>
                                  resolveTicket(id as string, "CLOSED")
                                }
                                variant="solid"
                              >
                                {t("Confirm")}
                              </Button>
                            </PopoverContentClose>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default TicketDetails;

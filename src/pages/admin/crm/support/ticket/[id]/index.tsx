import { formatDate } from "date-fns";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverContentClose,
  PopoverTrigger,
} from "@/components/elements/addons/popover/Popover";
import Avatar from "@/components/elements/base/avatar/Avatar";
import Button from "@/components/elements/base/button/Button";
import Card from "@/components/elements/base/card/Card";
import ActionItem from "@/components/elements/base/dropdown-action/ActionItem";
import DropdownAction from "@/components/elements/base/dropdown-action/DropdownAction";
import { PageHeader } from "@/components/elements/base/page-header";
import { Chat } from "@/components/pages/user/Chat";
import { TicketInformation } from "@/components/pages/user/support/TicketInformation";
import ListWidgetItem from "@/components/widgets/ListWidgetItem";
import Layout from "@/layouts/Default";
import { useDashboardStore } from "@/stores/dashboard";
import useTicketStore from "@/stores/user/support";
import $fetch from "@/utils/api";

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
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    if (router.isReady) {
      setIsSupport(true);
      fetchTicket(id as string);
      setIsReady(true);
      return () => {
        setIsReady(false);
      };
    }
  }, [router.isReady]);
  useEffect(() => {
    if (isReady) {
      initializeWebSocket(id as string);
      return () => {
        disconnectWebSocket();
      };
    }
  }, [isReady]);
  const handleDeleteTicket = async () => {
    const { error } = await $fetch({
      url: `/api/admin/crm/support/ticket/${id}`,
      method: "DELETE",
      silent: true,
    });
    if (!error) {
      router.push("/admin/crm/support");
    }
  };
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
              <div className="border-muted-200 border-b-2 border-dashed p-6 dark:border-muted-800">
                <div className="flex items-center gap-2">
                  <Avatar
                    alt="User photo"
                    className="bg-muted-100 dark:bg-muted-900"
                    size="sm"
                    src={
                      ticket?.user?.avatar || "/img/avatars/placeholder.webp"
                    }
                  />
                  <div className="relative font-sans">
                    <h3 className="font-semibold text-muted-800 leading-tight dark:text-muted-100">
                      {ticket?.user?.firstName} {ticket?.user?.lastName}
                    </h3>
                    <p className="text-muted-400 text-xs">
                      {t("Opened on")}{" "}
                      {formatDate(
                        new Date(ticket?.createdAt || new Date()),
                        "MMM dd, yyyy"
                      )}
                    </p>
                  </div>
                  <div className="ms-auto">
                    <DropdownAction orientation="end">
                      <div className="py-2">
                        <ActionItem
                          icon="ph:trash-duotone"
                          onClick={handleDeleteTicket}
                          subtext="Delete this ticket"
                          text="Delete"
                        />
                      </div>
                    </DropdownAction>
                  </div>
                </div>
              </div>

              <TicketInformation />
              <div className="border-muted-200 border-b-2 border-dashed p-6 dark:border-muted-800">
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
              <div className="p-6">
                <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
                  <Popover placement="top">
                    <PopoverTrigger>
                      {ticket?.status === "OPEN" ? (
                        <Button
                          className="w-full"
                          color="danger"
                          variant="solid"
                        >
                          {t("Close Ticket")}
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          color="success"
                          variant="solid"
                        >
                          {t("Reopen Ticket")}
                        </Button>
                      )}
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
                              onClick={
                                ticket?.status === "OPEN"
                                  ? () => resolveTicket(id as string, "CLOSED")
                                  : () => resolveTicket(id as string, "OPEN")
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
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default TicketDetails;
export const permission = "Access Support Ticket Management";

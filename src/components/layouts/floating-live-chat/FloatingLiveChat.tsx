import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { Tooltip } from "@/components/elements/base/tooltips/Tooltip";
import { Chat } from "@/components/pages/user/Chat";
import { useDashboardStore } from "@/stores/dashboard";
import useSupportStore from "@/stores/user/support";

const FloatingLiveChat = () => {
  const { t } = useTranslation();
  const { profile, settings } = useDashboardStore();
  const floatingLiveChatEnabled =
    settings?.floatingLiveChat === "true" ?? false;
  const {
    ticket,
    ws,
    fetchLiveTicket,
    disconnectWebSocket,
    replyToTicket,
    handleFileUpload,
    isReplying,
    initializeWebSocket,
  } = useSupportStore();

  const [open, setOpen] = useState(false);

  // Manage WebSocket connection based on the open state
  useEffect(() => {
    if (open) {
      if (!ticket) fetchLiveTicket();
    } else {
      disconnectWebSocket(); // Cleanup WebSocket connection
    }
  }, [open, ticket]);

  const toggleOpen = () => {
    if (!ws && ticket) {
      initializeWebSocket(ticket.id);
    }
    setOpen((state) => !state);
  };

  const messageSide = (userId) => (userId === profile?.id ? "left" : "right");

  return (
    <div
      className={`group/layouts fixed bottom-5 ${floatingLiveChatEnabled ? "right-20" : "right-5"} ${open ? "z-50" : "z-40"}`}
    >
      {/* Support Button */}
      <Tooltip content={t("Live Chat")}>
        <button
          aria-label="Support Chat"
          className={`flex items-center rounded-lg border border-muted-200 bg-white p-3 text-start shadow-lg shadow-muted-300/30 transition-all duration-300 hover:border-primary-500 dark:border-muted-800 dark:bg-muted-950 dark:shadow-muted-800/30 dark:hover:border-info-500 ${
            open
              ? "pointer-events-none translate-y-full opacity-0"
              : "pointer-events-auto translate-y-0 opacity-100"
          }`}
          name="supportChatToggle"
          onClick={toggleOpen}
          type="button"
        >
          <Icon
            className="h-6 w-6 shrink-0 text-muted-400 transition-colors duration-300 group-hover/layouts:text-info-500"
            icon="ph:chat-teardrop-text"
          />
        </button>
      </Tooltip>

      {/* Chat Panel */}
      <div
        className={`fixed right-5 bottom-5 z-1000 h-[420px] w-[300px] max-w-[90%] overflow-hidden rounded-lg border border-muted-200 bg-white shadow-lg shadow-muted-300/30 transition-all duration-300 hover:border-info-500 dark:border-muted-800 dark:bg-muted-950 dark:shadow-muted-800/30 dark:hover:border-info-500 ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-full opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-muted-200 border-b px-4 dark:border-muted-800">
          <h3 className="font-medium font-sans text-lg text-muted-800 dark:text-muted-100">
            {t("Support Chat")}
          </h3>
          <button
            aria-label="Close Support Chat"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted-100 transition-colors duration-300 hover:bg-muted-200 dark:bg-muted-800 dark:hover:bg-muted-700"
            onClick={toggleOpen}
            type="button"
          >
            <Icon
              className="h-4 w-4 text-muted-500 dark:text-muted-200"
              icon="lucide:x"
            />
          </button>
        </div>

        {/* Chat Content */}
        <div className="flex h-full flex-col">
          <Chat
            canReply={true}
            floating={true}
            handleFileUpload={handleFileUpload}
            isReplying={isReplying}
            messageSide={messageSide}
            messages={ticket?.messages || []}
            reply={replyToTicket}
            user1={ticket?.user}
            user2={ticket?.agent}
          />
        </div>
      </div>
    </div>
  );
};

export default FloatingLiveChat;

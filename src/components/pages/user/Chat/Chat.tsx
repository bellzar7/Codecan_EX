import { Icon } from "@iconify/react";
import { AnimatePresence } from "framer-motion";
import { debounce } from "lodash";
import { useTranslation } from "next-i18next";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import Card from "@/components/elements/base/card/Card";
import Textarea from "@/components/elements/form/textarea/Textarea";
import { Message } from "../support/Message";

const ChatBase = ({
  messages,
  handleFileUpload,
  messageSide,
  user1,
  user2,
  reply,
  isReplying,
  canReply,
  floating = false,
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);

  const [showScrollToBottomButton, setShowScrollToBottomButton] =
    useState(false);

  const messageContainerRef = useRef<HTMLDivElement>(null);

  function handleTextareaBlur(e) {
    const currentTarget = e.currentTarget; // Capture the current target at the time of the event.
    setTimeout(() => {
      // Ensure the current target still exists and check if it should still collapse
      if (currentTarget && !currentTarget.contains(document.activeElement)) {
        setExpanded(false);
      }
    }, 150); // A small delay to allow other event handlers to process
  }

  const onClickSend = () => {
    if (message) {
      reply(message);
      setMessage("");
      setExpanded(false); // Close the textarea explicitly here if you still want it to close after sending
    }
  };

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const startFromBottom = () => {
    setTimeout(() => {
      if (messageContainerRef.current) {
        messageContainerRef.current.scrollTop =
          messageContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  useEffect(() => {
    if (messages?.length) {
      startFromBottom();
    }
  }, [messages]);

  const handleScroll = () => {
    const container = messageContainerRef.current;
    if (!container) return;
    const tolerance = 1; // Adjust this tolerance as needed for pixel perfection
    const isAtBottom =
      Math.abs(
        container.scrollHeight - container.scrollTop - container.clientHeight
      ) <= tolerance;
    setShowScrollToBottomButton(!isAtBottom && hasMore);
  };

  const debouncedHandleScroll = useCallback(debounce(handleScroll, 100), [
    hasMore,
  ]);

  useEffect(() => {
    const container = messageContainerRef.current;
    if (container) {
      container.addEventListener("scroll", debouncedHandleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", debouncedHandleScroll);
      }
    };
  }, [debouncedHandleScroll]);

  useEffect(() => {
    const updateWidth = () => {
      if (messageContainerRef.current) {
        setContainerWidth(messageContainerRef.current?.offsetWidth - 2);
      }
    };
    updateWidth(); // Update on mount
    window.addEventListener("resize", updateWidth); // Update on window resize
    return () => {
      window.removeEventListener("resize", updateWidth); // Cleanup on unmount
    };
  }, []);

  return (
    <>
      <div
        className={`relative gap-5 ${floating ? "max-h-[368px]" : "card max-h-[calc(100vh-142px)]"} mb-5 h-full md:mb-0 ${
          canReply ? "pb-20" : "pb-0"
        }`}
      >
        <div
          className={
            "mx-auto flex h-full max-w-full flex-col gap-4 overflow-y-auto px-4 pb-8"
          }
          ref={messageContainerRef}
        >
          <AnimatePresence>
            {Array.isArray(messages) &&
              messages.map((message, index) => (
                <Message
                  agentAvatar={user2?.avatar || "/img/avatars/placeholder.webp"}
                  key={message.id || index}
                  message={message}
                  side={messageSide(message?.userId)}
                  type={message.type}
                  userAvatar={user1?.avatar || "/img/avatars/placeholder.webp"}
                />
              ))}
          </AnimatePresence>
        </div>

        {canReply && (
          <div className="absolute bottom-4 z-10 w-full px-4">
            {showScrollToBottomButton && (
              <div className="flex w-full justify-center">
                <IconButton
                  className="mb-2"
                  color="muted"
                  onClick={() => scrollToBottom()}
                  shape="full"
                  size="sm"
                  variant="solid"
                >
                  <Icon className="h-5 w-5" icon="mdi:chevron-down" />
                </IconButton>
              </div>
            )}
            <Card className="relative w-full transition-all duration-300">
              <Textarea
                className={
                  "!border-none !border-transparent !bg-transparent !leading-8 !shadow-none field-sizing-content -mb-2 transition-all duration-300"
                }
                id="compose-reply"
                onBlur={handleTextareaBlur}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={() => setExpanded(true)}
                placeholder={t("Write a message...")}
                rows={4}
                value={message}
              />
              <div className="absolute top-1.5 right-2 z-5 flex items-center justify-end gap-1.5 overflow-hidden">
                <IconButton
                  color={"info"}
                  disabled={isReplying}
                  shape="rounded"
                  size={"sm"}
                  variant="pastel"
                >
                  <input
                    accept="image/*,.heic,.heif"
                    className="absolute top-0 left-0 z-1 h-full w-full opacity-0"
                    id="upload-attachments"
                    onChange={(e) => handleFileUpload(e.target.files?.[0])}
                    type="file"
                  />
                  <Icon
                    className="relative h-6 w-6 p-0"
                    icon="material-symbols-light:upload"
                  />
                </IconButton>
                <IconButton
                  color={message ? "primary" : "muted"}
                  disabled={!message || isReplying}
                  onClick={onClickSend}
                  shape="rounded"
                  size={"sm"}
                  variant="pastel"
                >
                  <Icon
                    className="relative -right-0.5 h-5 w-5 p-0"
                    icon="fluent:send-24-filled"
                  />
                </IconButton>
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  );
};
export const Chat = memo(ChatBase);

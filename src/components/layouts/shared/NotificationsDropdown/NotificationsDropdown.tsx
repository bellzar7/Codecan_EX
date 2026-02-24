import { Icon } from "@iconify/react";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { Panel } from "@/components/elements/base/panel";
import NotificationTabs from "@/components/layouts/shared/NotificationsDropdown/NotificationTabs";
import { useDashboardStore } from "@/stores/dashboard";

const NotificationsDropdownBase = () => {
  const { t } = useTranslation();
  const [isPanelOpened, setIsPanelOpened] = useState(false);
  const { notifications } = useDashboardStore();

  const categories = {
    activity: notifications.filter(
      (notification) => notification.type.toLowerCase() === "activity"
    ),
    system: notifications.filter(
      (notification) => notification.type.toLowerCase() === "system"
    ),
    security: notifications.filter(
      (notification) => notification.type.toLowerCase() === "security"
    ),
  };
  const hasNotifications = Object.values(categories).some(
    (category) => category.length > 0
  );

  return (
    <>
      <div className="group relative text-start">
        {hasNotifications && (
          <span className="absolute top-0.5 right-0.5 z-2 block h-2 w-2 rounded-full bg-primary-500" />
        )}
        <button
          aria-label="Notifications dropdown"
          className="mask mask-blob flex h-10 w-10 rotate-0 cursor-pointer items-center justify-center text-muted-400 transition-all duration-300 hover:bg-primary-500/10 hover:text-primary-500 dark:hover:bg-primary-500/20"
          name="notificationsDropdownToggle"
          onClick={() => setIsPanelOpened(!isPanelOpened)}
          type="button"
        >
          <Icon
            className="h-4 w-4 text-muted-500 transition-colors duration-300 group-hover:text-primary-500"
            icon="ph:bell-duotone"
          />
        </button>
      </div>

      <Panel
        isOpen={!!isPanelOpened}
        onClose={() => setIsPanelOpened(false)}
        side="top"
        size="xl"
        title={t("Notifications")}
      >
        <NotificationTabs shape="rounded-sm" />
      </Panel>
    </>
  );
};
export const NotificationsDropdown = NotificationsDropdownBase;

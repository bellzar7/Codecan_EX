import { Tab } from "@headlessui/react";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { useTranslation } from "next-i18next";
import type React from "react";
import { useRef, useState } from "react";
import Button from "@/components/elements/base/button/Button";
import { useDashboardStore } from "@/stores/dashboard";
import { cn } from "@/utils/cn";

interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link: string;
  createdAt: string;
  updatedAt: string;
}
interface NotificationTabsProps {
  shape?: "straight" | "rounded-sm" | "smooth" | "curved" | "full";
}
const NotificationItem: React.FC<{
  item: Notification;
  index: number;
  onDragEnd: (event, info, id) => void;
}> = ({ item, index, onDragEnd }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.01 },
    }),
    exit: { opacity: 0, x: -100, transition: { duration: 0.5 } },
  };

  return (
    <motion.li
      animate={isInView ? "visible" : "hidden"}
      className="relative cursor-pointer rounded-md bg-muted-50 p-3 transition-colors duration-300 hover:bg-muted-100 dark:bg-muted-850 dark:hover:bg-muted-900"
      custom={index}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.4}
      exit="exit"
      initial="hidden"
      onDragEnd={(event, info) => onDragEnd(event, info, item.id)}
      ref={ref}
      style={{
        zIndex: 100 - index,
        position: "relative",
      }}
      variants={itemVariants}
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-3.5">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-muted-200 bg-white shadow-lg shadow-muted-300/30 dark:border-muted-800 dark:bg-muted-900 dark:shadow-muted-800/30">
            <Icon
              className="h-4 w-4 stroke-[1.28px] stroke-primary-500 text-primary-500 transition-[stroke] duration-300"
              icon="ph:notification-duotone"
            />
          </div>
          <div>
            <p className="text-muted-500 text-sm leading-snug">
              {item.link ? (
                <a
                  className="cursor-pointer font-medium text-primary-500 hover:underline"
                  href={item.link}
                >
                  {item.title}
                </a>
              ) : (
                <span className="font-medium text-primary-500">
                  {item.title}
                </span>
              )}{" "}
              {item.message}
            </p>
            <small className="text-muted-400 text-xs">
              {new Date(item.createdAt).toLocaleTimeString()}
            </small>
          </div>
        </div>
      </div>
    </motion.li>
  );
};

const NotificationTabs: React.FC<NotificationTabsProps> = ({
  shape = "smooth",
}) => {
  const { t } = useTranslation();
  const { notifications, removeNotification, clearNotifications } =
    useDashboardStore();
  const [clearIcon, setClearIcon] = useState<{
    [key: string]: boolean;
  }>({});
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

  const handleDragEnd = (event, info, id) => {
    if (info.point.x <= 25) {
      removeNotification(id);
    }
  };
  const handleClearClick = (category) => {
    if (clearIcon[category]) {
      clearNotifications(category);
    } else {
      setClearIcon((prev) => ({ ...prev, [category]: true }));
    }
  };
  return (
    <div className="slimscroll relative flex h-full w-full flex-col overflow-x-hidden">
      <div className="shrink-0 pe-1">
        <Tab.Group>
          <Tab.List
            className={`flex space-x-1 bg-muted-100 p-1 dark:bg-muted-900 ${shape === "rounded-sm" ? "rounded-md" : ""}
              ${shape === "smooth" ? "rounded-lg" : ""}
              ${shape === "curved" ? "rounded-xl" : ""}
              ${shape === "full" ? "rounded-full" : ""}
            `}
          >
            {Object.keys(categories).map((category) => (
              <Tab
                className={({ selected }) =>
                  cn(
                    "w-full py-2.5 font-medium text-sm leading-5",
                    shape === "rounded-sm" ? "rounded-md" : "",
                    shape === "smooth" ? "rounded-lg" : "",
                    shape === "curved" ? "rounded-xl" : "",
                    shape === "full" ? "rounded-full" : "",
                    selected
                      ? "bg-white text-primary-500 shadow-sm dark:bg-muted-800"
                      : "text-muted-400 hover:text-muted-500 dark:hover:text-muted-100"
                  )
                }
                key={category}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)} (
                {categories[category].length})
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="mt-2 grow">
            {Object.entries(categories).map(([category, items]) => (
              <Tab.Panel className="relative py-3" key={category}>
                {items.length === 0 ? (
                  <div className="text-center text-md text-muted-500">
                    {t("All caught up")}
                  </div>
                ) : (
                  <>
                    <AnimatePresence initial={false}>
                      <ul className="relative space-y-2">
                        {items.map((item: Notification, index) => (
                          <NotificationItem
                            index={index} // Ensure this key is unique for each item
                            item={item}
                            key={item.id}
                            onDragEnd={handleDragEnd}
                          />
                        ))}
                      </ul>
                    </AnimatePresence>
                    <div className="mt-2 flex justify-end">
                      <Button
                        color={"danger"}
                        onClick={() => handleClearClick(category)}
                        shape={"rounded-sm"}
                        size={"sm"}
                        variant={"pastel"}
                      >
                        {clearIcon[category] ? (
                          `Clear ${category} notifications`
                        ) : (
                          <Icon
                            className="h-4 w-4 text-danger-500"
                            icon="ph:x-bold"
                          />
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};
export default NotificationTabs;

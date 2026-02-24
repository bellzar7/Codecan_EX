import { Icon } from "@iconify/react";
import { motion, useInView } from "framer-motion";
import { useTranslation } from "next-i18next";
import type React from "react";
import { memo, useRef } from "react";
import { useDashboardStore } from "@/stores/dashboard";
import type { Announcement, AnnouncementsProps } from "./Announcements.types";

const AnnouncementItem: React.FC<{
  item: Announcement;
  index: number;
}> = ({ item, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.01 },
    }),
  };
  return (
    <motion.li
      animate={isInView ? "visible" : "hidden"}
      className="relative cursor-pointer rounded-md bg-muted-50 p-3 transition-colors duration-300 hover:bg-muted-100 dark:bg-muted-850 dark:hover:bg-muted-900"
      custom={index}
      exit={{ opacity: 0, y: 20 }}
      initial="hidden"
      ref={ref}
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

const AnnouncementsBase: React.FC<AnnouncementsProps> = ({}) => {
  const { t } = useTranslation();
  const { announcements } = useDashboardStore();
  return (
    <div className="slimscroll relative flex w-full flex-col overflow-x-hidden">
      <div className="mt-2 grow">
        {announcements.length === 0 ? (
          <div className="text-center text-md text-muted-500">
            {t("No announcements available.")}
          </div>
        ) : (
          <ul className="slimscroll relative max-h-[calc(100vh_-_80px)] space-y-2 overflow-y-auto pe-1">
            {announcements.map((item: Announcement, index) => (
              <AnnouncementItem index={index} item={item} key={item.id} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
export const Announcements = memo(AnnouncementsBase);

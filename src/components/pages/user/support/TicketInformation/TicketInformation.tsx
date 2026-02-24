import { Icon } from "@iconify/react";
import { formatDate } from "date-fns";
import { capitalize } from "lodash";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { memo } from "react";
import IconBox from "@/components/elements/base/iconbox/IconBox";
import ListWidgetItem from "@/components/widgets/ListWidgetItem";
import useSupportStore from "@/stores/user/support";

const TicketInformationBase = () => {
  const { t } = useTranslation();
  const { ticket, isSupport } = useSupportStore();
  // Mapping for icon configurations based on the ticket status
  const statusIcons = {
    PENDING: {
      icon: "ph:circle-duotone",
      className: "bg-warning-500/10",
      iconClasses: "text-warning-500",
    },
    OPEN: {
      icon: "ph:circle-duotone",
      className: "bg-info-500/10",
      iconClasses: "text-info-500",
    },
    REPLIED: {
      icon: "ph:circle-duotone",
      className: "bg-primary-500/10",
      iconClasses: "text-primary-500",
    },
    CLOSED: {
      icon: "ph:check-circle-duotone",
      className: "bg-success-500/10",
      iconClasses: "text-success-500",
    },
  };
  // Function to get icon configuration based on status
  const getIconConfig = (status) => {
    return statusIcons[status] || statusIcons["PENDING"]; // Default to PENDING if status is undefined
  };
  return (
    <div className="border-muted-200 border-b-2 border-dashed p-6 dark:border-muted-800">
      <h4 className="mb-4 font-medium font-sans text-muted-500 text-xs uppercase">
        {t("Information")}
      </h4>

      <ul className="relative">
        <li>
          <ListWidgetItem
            avatar={
              <IconBox
                className="h-8! w-8! rounded-lg! bg-primary-500/10"
                icon="ph:credit-card-duotone"
                iconClasses="h-5! w-5! text-primary-500"
              />
            }
            avatarSize="xs"
            href="#"
            itemAction={<></>}
            text={ticket?.id || "Loading..."}
            title={t("Ticket ID")}
          />
          <ListWidgetItem
            avatar={
              <IconBox
                className="h-8! w-8! rounded-lg! bg-success-500/10"
                icon="ph:timer-duotone"
                iconClasses="h-5! w-5! text-success-500"
              />
            }
            avatarSize="xs"
            href="#"
            itemAction={<></>}
            text={capitalize(ticket?.importance) || "Loading..."}
            title={t("Priority")}
          />
          {isSupport && (
            <ListWidgetItem
              avatar={
                <IconBox
                  className="h-8! w-8! rounded-lg! bg-info-500/10"
                  icon="ph:envelope-duotone"
                  iconClasses="h-5! w-5! text-info-500"
                />
              }
              avatarSize="xs"
              href="#"
              itemAction={
                <Link
                  className="cursor-pointer text-muted-400 transition-colors duration-300 hover:text-primary-500"
                  href={`mailto:${ticket?.user?.email}`}
                >
                  <Icon icon="lucide:arrow-right" />
                </Link>
              }
              text={ticket?.user?.email || "Loading..."}
              title={t("Email")}
            />
          )}
          <ListWidgetItem
            avatar={
              <IconBox
                {...getIconConfig(ticket?.status.toUpperCase())}
                className="h-8! w-8! rounded-lg!"
              />
            }
            avatarSize="xs"
            href="#"
            itemAction={<></>}
            text={`${capitalize(ticket?.status) || "Loading..."} ${formatDate(
              new Date(ticket?.updatedAt || new Date()),
              "MMM dd, yyyy h:mm a"
            )}`}
            title={t("Status")}
          />
        </li>
      </ul>
    </div>
  );
};
export const TicketInformation = memo(TicketInformationBase);

import { Icon } from "@iconify/react";
import { capitalize } from "lodash";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { memo } from "react";
import IconBox from "@/components/elements/base/iconbox/IconBox";
import ListWidgetItem from "@/components/widgets/ListWidgetItem";
import useP2PStore from "@/stores/user/p2p/trade";

const TradeInfoBase = () => {
  const { t } = useTranslation();
  const { trade, isSeller } = useP2PStore();

  const disputeStatus = {
    PENDING: {
      icon: "ph:circle-duotone",
      className: "bg-warning-500/10",
      iconClasses: "text-warning-500",
    },
    IN_PROGRESS: {
      icon: "ph:circle-duotone",
      className: "bg-info-500/10",
      iconClasses: "text-info-500",
    },
    RESOLVED: {
      icon: "ph:circle-duotone",
      className: "bg-success-500/10",
      iconClasses: "text-success-500",
    },
    CANCELLED: {
      icon: "ph:circle-duotone",
      className: "bg-danger-500/10",
      iconClasses: "text-danger-500",
    },
  };

  const statusIcons = {
    PENDING: {
      icon: "ph:circle-duotone",
      className: "bg-warning-500/10",
      iconClasses: "text-warning-500",
    },
    PAID: {
      icon: "ph:circle-duotone",
      className: "bg-info-500/10",
      iconClasses: "text-info-500",
    },
    DISPUTE_OPEN: {
      icon: "ph:circle-duotone",
      className: "bg-danger-500/10",
      iconClasses: "text-danger-500",
    },
    ESCROW_REVIEW: {
      icon: "ph:circle-duotone",
      className: "bg-info-500/10",
      iconClasses: "text-info-500",
    },
    CANCELLED: {
      icon: "ph:circle-duotone",
      className: "bg-danger-500/10",
      iconClasses: "text-danger-500",
    },
    COMPLETED: {
      icon: "ph:circle-duotone",
      className: "bg-success-500/10",
      iconClasses: "text-success-500",
    },
    REFUNDED: {
      icon: "ph:circle-duotone",
      className: "bg-secondary-500/10",
      iconClasses: "text-secondary-500",
    },
  };

  // Function to get icon configuration based on status
  const getIconConfig = (status) => {
    return statusIcons[status] || statusIcons["PENDING"]; // Default to PENDING if status is undefined
  };

  return (
    <>
      <div className="border-muted-200 border-b-2 border-dashed p-6 dark:border-muted-800">
        <h4 className="mb-4 font-medium font-sans text-muted-500 text-xs uppercase">
          {t("Payment Method")}
        </h4>

        <ul className="relative">
          <li>
            <ListWidgetItem
              avatar={
                <IconBox
                  className="h-8! w-8! rounded-lg! bg-success-500/10"
                  icon="ph:calendar-duotone"
                  iconClasses="h-5! w-5! text-success-500"
                />
              }
              avatarSize="xs"
              href="#"
              itemAction={<></>}
              text={trade?.offer.paymentMethod.name || "Loading..."}
              title={t("Method")}
            />
            <ListWidgetItem
              avatar={
                <IconBox
                  className="h-8! w-8! rounded-lg! bg-success-500/10"
                  icon="ph:calendar-duotone"
                  iconClasses="h-5! w-5! text-success-500"
                />
              }
              avatarSize="xs"
              href="#"
              itemAction={<></>}
              text={trade?.offer.currency || "Loading..."}
              title={t("Currency")}
            />
            {trade?.offer.paymentMethod.chain && (
              <ListWidgetItem
                avatar={
                  <IconBox
                    className="h-8! w-8! rounded-lg! bg-success-500/10"
                    icon="ph:calendar-duotone"
                    iconClasses="h-5! w-5! text-success-500"
                  />
                }
                avatarSize="xs"
                href="#"
                itemAction={<></>}
                text={trade?.offer.paymentMethod.chain || "Loading..."}
                title={t("Chain")}
              />
            )}
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
              text={trade?.offer.paymentMethod.instructions || "Loading..."}
              title={t("Instructions")}
            />
          </li>
        </ul>
      </div>
      <div className="p-6">
        <h4 className="mb-4 font-medium font-sans text-muted-500 text-xs uppercase">
          {t("Summary")}
        </h4>

        <ul className="relative">
          <li>
            {/*<ListWidgetItem*/}
            {/*  href="#"*/}
            {/*  avatarSize="xs"*/}
            {/*  avatar={*/}
            {/*    <IconBox*/}
            {/*      icon="ph:timer-duotone"*/}
            {/*      className="h-8! w-8! rounded-lg! bg-success-500/10"*/}
            {/*      iconClasses="h-5! w-5! text-success-500"*/}
            {/*    />*/}
            {/*  }*/}
            {/*  title={t("Transaction Hash")}*/}
            {/*  text={trade?.txHash || "Not provided by buyer yet..."}*/}
            {/*  itemAction={<></>}*/}
            {/*/>*/}
            {isSeller && (
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
                    href={`mailto:${trade?.user?.email}`}
                  >
                    <Icon icon="lucide:arrow-right" />
                  </Link>
                }
                text={trade?.user?.email || "Loading..."}
                title={t("Email")}
              />
            )}
            <ListWidgetItem
              avatar={
                <IconBox
                  {...getIconConfig(trade?.status.toUpperCase())}
                  className="h-8! w-8! rounded-lg!"
                />
              }
              avatarSize="xs"
              href="#"
              itemAction={<></>}
              text={`${capitalize(trade?.status) || "Loading..."}`}
              title={t("Status")}
            />
            <ListWidgetItem
              avatar={
                <IconBox
                  className="h-8! w-8! rounded-lg! bg-primary-500/10"
                  icon="ph:info-duotone"
                  iconClasses="h-5! w-5! text-primary-500"
                />
              }
              avatarSize="xs"
              href="#"
              itemAction={<></>}
              text={isSeller ? t("Seller") : t("Buyer")}
              title={t("You are the")}
            />
          </li>
        </ul>
      </div>

      {trade?.p2pDisputes[0] && (
        <div className="border-muted-200 border-t-2 border-dashed p-6 dark:border-muted-800">
          <h4 className="mb-4 font-medium font-sans text-muted-500 text-xs uppercase">
            {t("Dispute")}
          </h4>

          <ul className="relative">
            <li>
              <ListWidgetItem
                avatar={
                  <IconBox
                    {...getIconConfig(
                      trade?.p2pDisputes[0].status.toUpperCase()
                    )}
                    className="h-8! w-8! rounded-lg!"
                  />
                }
                avatarSize="xs"
                href="#"
                itemAction={<></>}
                text={`${
                  capitalize(trade?.p2pDisputes[0].status) || "Loading..."
                }`}
                title={t("Status")}
              />
              <ListWidgetItem
                avatar={
                  <IconBox
                    className="h-8! w-8! rounded-lg! bg-success-500/10"
                    icon="ph:calendar-duotone"
                    iconClasses="h-5! w-5! text-success-500"
                  />
                }
                avatarSize="xs"
                href="#"
                itemAction={<></>}
                text={`${trade?.p2pDisputes[0].raisedBy?.firstName} ${trade?.p2pDisputes[0].raisedBy?.lastName}`}
                title={t("Raised by")}
              />
              <ListWidgetItem
                avatar={
                  <IconBox
                    className="h-8! w-8! rounded-lg! bg-success-500/10"
                    icon="ph:calendar-duotone"
                    iconClasses="h-5! w-5! text-success-500"
                  />
                }
                avatarSize="xs"
                href="#"
                itemAction={<></>}
                text={
                  trade?.p2pDisputes[0].reason || "Not provided by buyer yet..."
                }
                title={t("Reason")}
              />
              <ListWidgetItem
                avatar={
                  <IconBox
                    className="h-8! w-8! rounded-lg! bg-success-500/10"
                    icon="ph:calendar-duotone"
                    iconClasses="h-5! w-5! text-success-500"
                  />
                }
                avatarSize="xs"
                href="#"
                itemAction={<></>}
                text={
                  trade?.p2pDisputes[0].resolution ||
                  "Not provided by buyer yet..."
                }
                title={t("Resolution")}
              />
            </li>
          </ul>
        </div>
      )}
    </>
  );
};

export const TradeInfo = memo(TradeInfoBase);

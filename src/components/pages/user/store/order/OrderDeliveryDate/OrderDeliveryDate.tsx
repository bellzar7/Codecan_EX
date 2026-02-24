import { formatDate } from "date-fns";
import { useTranslation } from "next-i18next";
import { memo } from "react";
import IconBox from "@/components/elements/base/iconbox/IconBox";
import ListWidgetItem from "@/components/widgets/ListWidgetItem";

const OrderDeliveryDateBase = ({ shipping }) => {
  const { t } = useTranslation();
  return (
    <li>
      <ListWidgetItem
        avatar={
          <IconBox
            className="h-8! w-8! rounded-lg! bg-success-500/10"
            icon="ph:truck-duotone"
            iconClasses="h-5! w-5! text-success-500"
          />
        }
        avatarSize="xs"
        href="#"
        itemAction={<></>}
        text={
          shipping.deliveryDate
            ? formatDate(new Date(shipping.deliveryDate), "dd MMM yyyy")
            : "Pending"
        }
        title={t("Estimated Delivery")}
      />
    </li>
  );
};
export const OrderDeliveryDate = memo(OrderDeliveryDateBase);

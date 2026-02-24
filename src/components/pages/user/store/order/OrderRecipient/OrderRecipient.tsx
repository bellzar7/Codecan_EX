import { useTranslation } from "next-i18next";
import { memo } from "react";

const OrderRecipientBase = ({ shippingAddress }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex flex-col">
        <span className="mb-2 text-muted-400 text-xs uppercase">
          {t("Recipient")}
        </span>
        <ul className="text-muted-800">
          <li className="flex divide-x divide-muted-200 border border-muted-200 text-sm dark:divide-muted-800 dark:border-muted-800">
            <div className="flex-1 p-2 text-muted-400">{t("Name")}</div>
            <div className="flex-1 p-2 font-medium text-muted-800 dark:text-muted-100">
              {shippingAddress?.name}
            </div>
          </li>
          <li className="flex divide-x divide-muted-200 border border-muted-200 text-sm dark:divide-muted-800 dark:border-muted-800">
            <div className="flex-1 p-2 text-muted-400">{t("Email")}</div>
            <div className="flex-1 p-2 font-medium text-muted-800 dark:text-muted-100">
              {shippingAddress?.email}
            </div>
          </li>
          <li className="flex divide-x divide-muted-200 border border-muted-200 text-sm dark:divide-muted-800 dark:border-muted-800">
            <div className="flex-1 p-2 text-muted-400">{t("Phone")}</div>
            <div className="flex-1 p-2 font-medium text-muted-800 dark:text-muted-100">
              {shippingAddress?.phone}
            </div>
          </li>
          <li className="flex divide-x divide-muted-200 border border-muted-200 text-sm dark:divide-muted-800 dark:border-muted-800">
            <div className="flex-1 p-2 text-muted-400">{t("Street")}</div>
            <div className="flex-1 p-2 font-medium text-muted-800 dark:text-muted-100">
              {shippingAddress?.street}
            </div>
          </li>
          <li className="flex divide-x divide-muted-200 border border-muted-200 text-sm dark:divide-muted-800 dark:border-muted-800">
            <div className="flex-1 p-2 text-muted-400">{t("City")}</div>
            <div className="flex-1 p-2 font-medium text-muted-800 dark:text-muted-100">
              {shippingAddress?.city}
            </div>
          </li>
          <li className="flex divide-x divide-muted-200 border border-muted-200 text-sm dark:divide-muted-800 dark:border-muted-800">
            <div className="flex-1 p-2 text-muted-400">{t("State")}</div>
            <div className="flex-1 p-2 font-medium text-muted-800 dark:text-muted-100">
              {shippingAddress?.state}
            </div>
          </li>
          <li className="flex divide-x divide-muted-200 border border-muted-200 text-sm dark:divide-muted-800 dark:border-muted-800">
            <div className="flex-1 p-2 text-muted-400">{t("Postal Code")}</div>
            <div className="flex-1 p-2 font-medium text-muted-800 dark:text-muted-100">
              {shippingAddress?.postalCode}
            </div>
          </li>
          <li className="flex divide-x divide-muted-200 border border-muted-200 text-sm dark:divide-muted-800 dark:border-muted-800">
            <div className="flex-1 p-2 text-muted-400">{t("Country")}</div>
            <div className="flex-1 p-2 font-medium text-muted-800 dark:text-muted-100">
              {shippingAddress?.country}
            </div>
          </li>
        </ul>
      </div>
    </>
  );
};

export const OrderRecipient = memo(OrderRecipientBase);

import { useTranslation } from "next-i18next";
import Tag from "@/components/elements/base/tag/Tag";

const OrderUserInfo = ({ order }) => {
  const { t } = useTranslation();
  return (
    <div className="mb-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="mb-2 font-semibold text-lg dark:text-white">
          {t("User Information")}
        </h2>
        <Tag
          color={
            order.status === "PENDING"
              ? "warning"
              : order.status === "COMPLETED"
                ? "success"
                : order.status === "CANCELLED"
                  ? "danger"
                  : "muted"
          }
        >
          {order.status}
        </Tag>
      </div>
      <div className="flex flex-col">
        <span className="mb-2 text-muted-400 text-xs uppercase dark:text-gray-400">
          {t("Recipient")}
        </span>
        <ul className="text-muted-800 dark:text-gray-300">
          <li className="flex divide-x divide-muted-200 border-muted-200 border-x border-t text-sm dark:divide-gray-700 dark:border-gray-700">
            <div className="w-1/4 p-2 text-muted-400 dark:text-gray-400">
              {t("Name")}
            </div>
            <div className="flex-1 p-2 font-medium text-muted-800 dark:text-gray-300">
              {order.user.firstName} {order.user.lastName}
            </div>
          </li>
          <li className="flex divide-x divide-muted-200 border border-muted-200 text-sm dark:divide-gray-700 dark:border-gray-700">
            <div className="w-1/4 p-2 text-muted-400 dark:text-gray-400">
              {t("Email")}
            </div>
            <div className="flex-1 p-2 font-medium text-muted-800 dark:text-gray-300">
              {order.user.email}
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default OrderUserInfo;

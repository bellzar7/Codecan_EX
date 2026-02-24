import { capitalize } from "lodash";
import { useTranslation } from "next-i18next";
import { memo } from "react";
import Card from "@/components/elements/base/card/Card";

const ProductDetailsBase = ({ product, categoryName }) => {
  const { t } = useTranslation();
  return (
    <Card
      className="text-muted-800 text-sm dark:text-muted-200"
      color="contrast"
    >
      <h3 className="px-5 py-3 font-semibold text-md">
        {t("Product Details")}
      </h3>
      <ul className="flex flex-col gap-1">
        <li className="flex justify-between border-muted-200 border-b px-5 pb-1 dark:border-muted-700">
          <p className="text-muted-500 dark:text-muted-300">{t("Name")}</p>{" "}
          {product?.name}
        </li>
        <li className="flex justify-between border-muted-200 border-b px-5 pb-1 dark:border-muted-700">
          <p className="text-muted-500 dark:text-muted-300">{t("Category")}</p>{" "}
          {categoryName}
        </li>
        <li className="flex justify-between border-muted-200 border-b px-5 pb-1 dark:border-muted-700">
          <p className="text-muted-500 dark:text-muted-300">{t("Type")}</p>{" "}
          {capitalize(product?.type)}
        </li>
        <li className="flex justify-between border-muted-200 border-b px-5 pb-1 dark:border-muted-700">
          <p className="text-muted-500 dark:text-muted-300">{t("Price")}</p>{" "}
          {product?.price} {product?.currency}
        </li>
        <li className="flex justify-between px-5 pb-2">
          <p className="text-muted-500 dark:text-muted-300">{t("Stock")}</p>{" "}
          {product?.inventoryQuantity}
        </li>
      </ul>
    </Card>
  );
};
export const ProductDetails = memo(ProductDetailsBase);

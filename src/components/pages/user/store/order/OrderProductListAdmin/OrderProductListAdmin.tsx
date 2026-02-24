import { Icon } from "@iconify/react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import Card from "@/components/elements/base/card/Card";
import { MashImage } from "@/components/elements/MashImage";
import ListWidgetItem from "@/components/widgets/ListWidgetItem";

const OrderProductListAdmin = ({ products }) => {
  const { t } = useTranslation();
  return (
    <Card className="p-4">
      <h4 className="mb-4 font-medium font-sans text-muted-500 text-xs uppercase">
        {t("Products")}
      </h4>
      <ul className="inner-list">
        {products.map((product, index) => (
          <li key={index}>
            <ListWidgetItem
              avatar={
                <MashImage
                  alt={product.name}
                  className="rounded-lg"
                  height={64}
                  src={product.image || "/img/placeholder.svg"}
                  width={64}
                />
              }
              avatarSize="xxs"
              href="#"
              itemAction={
                <div className="flex items-center gap-2">
                  <Link
                    className="cursor-pointer text-muted-400 transition-colors duration-300 hover:text-primary-500"
                    href={`/store/${product.category?.name}/${product.name}`}
                  >
                    <Icon icon="lucide:arrow-right" />
                  </Link>
                </div>
              }
              text={`${product.price} ${product.currency}`}
              title={product.name}
            />
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default OrderProductListAdmin;

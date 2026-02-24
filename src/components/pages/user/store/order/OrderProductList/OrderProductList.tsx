import { Icon } from "@iconify/react";
import Link from "next/link";
import { memo } from "react";
import { Tooltip } from "@/components/elements/base/tooltips/Tooltip";
import { MashImage } from "@/components/elements/MashImage";
import ListWidgetItem from "@/components/widgets/ListWidgetItem";

const OrderProductListBase = ({ products }) => {
  return products.map((product, index) => (
    <li key={index}>
      <ListWidgetItem
        avatar={
          <MashImage
            alt="Nitro Inc."
            className="rounded-lg"
            height={32}
            src={product.image || "/img/placeholder.svg"}
            width={32}
          />
        }
        avatarSize="xxs"
        href="#"
        itemAction={
          <div className="flex items-center gap-2">
            {product.type === "DOWNLOADABLE" && (
              <Tooltip
                content={
                  product.ecommerceOrderItem?.key
                    ? "Download key"
                    : product.ecommerceOrderItem?.filePath
                      ? "Download file"
                      : "Not available yet"
                }
              >
                <Icon
                  className="cursor-pointer text-muted-400 transition-colors duration-300 hover:text-primary-500"
                  icon="line-md:downloading-loop"
                  onClick={() => {
                    if (product.ecommerceOrderItem?.key) {
                      const element = document.createElement("a");
                      const file = new Blob(
                        [
                          "Product Activation Key\n\n" +
                            "Dear Customer,\n\n" +
                            "Thank you for your purchase. Please find your product activation key below:\n\n" +
                            `Key: ${product.ecommerceOrderItem.key}\n\n` +
                            "To activate your product, enter the key in the designated field during the installation or setup process. If you encounter any issues or have questions, please do not hesitate to contact our support team.\n\n" +
                            "Best regards,\n" +
                            `${process.env.NEXT_PUBLIC_SITE_NAME} Support Team\n` +
                            `${process.env.NEXT_PUBLIC_APP_EMAIL}`,
                        ],
                        { type: "text/plain" }
                      );

                      element.href = URL.createObjectURL(file);
                      element.download = `${product.name}-key.txt`;
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                    } else if (product.ecommerceOrderItem?.filePath) {
                      const element = document.createElement("a");
                      element.href = product.ecommerceOrderItem.filePath;
                      element.download = `${product.name}`;
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                    }
                  }}
                />
              </Tooltip>
            )}

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
  ));
};

export const OrderProductList = memo(OrderProductListBase);

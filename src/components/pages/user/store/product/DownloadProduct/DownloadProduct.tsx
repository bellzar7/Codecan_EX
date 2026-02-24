import { Icon } from "@iconify/react";
import { memo } from "react";
import Button from "@/components/elements/base/button/Button";

const DownloadProductBase = ({ product }) => {
  return (
    <div className="px-5 pb-5">
      <Button
        className="mt-4 w-full"
        color="success"
        onClick={() => {
          if (product.orders[0].ecommerceOrderItem?.key) {
            const element = document.createElement("a");
            const file = new Blob(
              [
                "Product Activation Key\n\n" +
                  "Dear Customer,\n\n" +
                  "Thank you for your purchase. Please find your product activation key below:\n\n" +
                  `Key: ${product.orders[0].ecommerceOrderItem.key}\n\n` +
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
          } else if (product.orders[0].ecommerceOrderItem?.filePath) {
            const element = document.createElement("a");
            element.href = product.orders[0].ecommerceOrderItem.filePath;
            element.download = `${product.name}`;
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
          }
        }}
        shape="rounded-sm"
        type="button"
      >
        <Icon icon="line-md:downloading-loop" />
        <span>
          {product.orders[0].ecommerceOrderItem?.key
            ? "Download key"
            : product.orders[0].ecommerceOrderItem?.filePath
              ? "Download file"
              : "Not available yet"}
        </span>
      </Button>
    </div>
  );
};

export const DownloadProduct = memo(DownloadProductBase);

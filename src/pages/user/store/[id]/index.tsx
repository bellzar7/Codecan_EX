import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { BackButton } from "@/components/elements/base/button/BackButton";
import Button from "@/components/elements/base/button/Button";
import Card from "@/components/elements/base/card/Card";
import IconBox from "@/components/elements/base/iconbox/IconBox";
import Tag from "@/components/elements/base/tag/Tag";
import { BarCode } from "@/components/pages/user/store/order/BarCode";
import { OrderDeliveryDate } from "@/components/pages/user/store/order/OrderDeliveryDate";
import { OrderProductList } from "@/components/pages/user/store/order/OrderProductList";
import { OrderRecipient } from "@/components/pages/user/store/order/OrderRecipient";
import { OrderShippingCost } from "@/components/pages/user/store/order/OrderShippingCost";
import { OrderShippingDetails } from "@/components/pages/user/store/order/OrderShippingDetails";
import ListWidgetItem from "@/components/widgets/ListWidgetItem";
import Layout from "@/layouts/Default";
import { useDashboardStore } from "@/stores/dashboard";
import $fetch from "@/utils/api";

type Order = {
  id: string;
  userId: string;
  status: "COMPLETED" | "PENDING" | "CANCELLED";
  shippingId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  products: {
    name: string;
    price: number;
    status: boolean;
    type: "DOWNLOADABLE" | "PHYSICAL";
    image: string;
    currency: string;
    walletType: string;
    category: {
      name: string;
    };
    ecommerceOrderItem: {
      quantity: number;
      key: string;
      filePath: string;
    };
  }[];
  shipping: Shipping;
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
};
type Shipping = {
  id: string;
  loadId: string;
  loadStatus: "PENDING" | "TRANSIT" | "DELIVERED" | "CANCELLED";
  shipper: string;
  transporter: string;
  goodsType: string;
  weight: number;
  volume: number;
  description: string;
  vehicle: string;
  cost?: number;
  tax?: number;
  deliveryDate?: string;
  createdAt?: string;
  updatedAt?: string;
};
const OrderReceipt = () => {
  const { t } = useTranslation();
  const { profile } = useDashboardStore();
  const router = useRouter();
  const { id } = router.query as {
    id: string;
  };
  const [order, setOrder] = useState<Order | null>(null);
  const fetchOrder = async () => {
    const { data, error } = await $fetch({
      url: `/api/ext/ecommerce/order/${id}`,
      silent: true,
    });
    if (!error) {
      setOrder(data as any);
    }
  };
  useEffect(() => {
    if (router.isReady) {
      fetchOrder();
    }
  }, [router.isReady]);
  const handlePrint = () => {
    const printable = document.getElementById("printable");
    if (printable) {
      // Create a new style element
      const style = document.createElement("style");
      style.innerHTML = `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable, #printable * {
            visibility: visible;
          }
          #printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `;
      // Append the style to the document head
      document.head.appendChild(style);
      // Print the content of the printable element
      window.print();
      // Remove the style after printing
      document.head.removeChild(style);
    }
  };
  if (!order) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Icon
            className="h-12 w-12 animate-spin text-primary-500"
            icon="mdi:loading"
          />
          <p className="text-primary-500 text-xl">{t("Loading order...")}</p>
        </div>
      </div>
    );
  }
  return (
    <Layout color="muted" title={t("Receipt")}>
      <main>
        <div className="mb-6 flex w-full">
          <div className="flex w-full flex-col items-center justify-between gap-4 md:flex-row">
            <div>
              <h2 className="font-light font-sans text-2xl text-muted-800 leading-tight dark:text-muted-100">
                {t("Receipt")}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <BackButton href={"/user/store"} />
              <Button className="w-24" onClick={handlePrint} type="button">
                <Icon className="mr-2" icon="mdi:printer" />
                {t("Print")}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6" id="printable">
          <div className="col-span-12 ltablet:col-span-8 lg:col-span-8">
            <Card
              className="flex w-full flex-col p-8 font-sans"
              color="contrast"
            >
              <div className="flex flex-row justify-between border-muted-200 border-b pb-6 dark:border-muted-800">
                <div className="mx-auto flex w-full flex-col">
                  <div className="flex flex-row">
                    <h3 className="text-xl">
                      <span className="block text-muted-400 text-sm">
                        {t("PROOF OF DELIVERY")}
                      </span>
                      <span className="block text-base text-muted-800 dark:text-muted-100">
                        {t("Order")} {order.id}
                      </span>
                    </h3>
                  </div>
                  {order.shipping && <BarCode date={order.createdAt} id={id} />}
                </div>
                {!order.shipping && (
                  <div className="brand">
                    <Tag color="warning" shape="rounded-sm" variant="pastel">
                      {t("PENDING")}
                    </Tag>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-5 pt-6">
                {order.products.some(
                  (product) => product.type === "PHYSICAL"
                ) ? (
                  <OrderRecipient shippingAddress={order.shippingAddress} />
                ) : (
                  <div className="flex flex-col">
                    <span className="mb-2 text-muted-400 text-xs uppercase">
                      {t("Recipient")}
                    </span>
                    <ul className="text-muted-800">
                      <li className="flex divide-x divide-muted-200 border border-muted-200 text-sm dark:divide-muted-800 dark:border-muted-800">
                        <div className="flex-1 p-2 text-muted-400">
                          {t("Name")}
                        </div>
                        <div className="flex-1 p-2 font-medium text-muted-800 dark:text-muted-100">
                          {profile?.firstName} {profile?.lastName}
                        </div>
                      </li>
                      <li className="flex divide-x divide-muted-200 border border-muted-200 text-sm dark:divide-muted-800 dark:border-muted-800">
                        <div className="flex-1 p-2 text-muted-400">
                          {t("Email")}
                        </div>
                        <div className="flex-1 p-2 font-medium text-muted-800 dark:text-muted-100">
                          {profile?.email}
                        </div>
                      </li>
                    </ul>
                  </div>
                )}
                {order.shipping && (
                  <OrderShippingDetails shipping={order.shipping} />
                )}
              </div>
              {order.shipping && (
                <OrderShippingCost shipping={order.shipping} />
              )}
            </Card>
          </div>

          <div className="col-span-12 ltablet:col-span-4 lg:col-span-4">
            <Card color="contrast" shape="smooth">
              <div className="border-muted-200 border-b-2 border-dashed p-6 dark:border-muted-800">
                <h4 className="mb-4 font-medium font-sans text-muted-500 text-xs uppercase">
                  {t("Order Info")}
                </h4>

                <ul className="relative">
                  {order.shipping && (
                    <OrderDeliveryDate shipping={order.shipping} />
                  )}
                  <li>
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
                          href={`mailto:${process.env.NEXT_PUBLIC_APP_EMAIL}`}
                        >
                          <Icon icon="lucide:arrow-right" />
                        </Link>
                      }
                      text={
                        process.env.NEXT_PUBLIC_APP_EMAIL || "Not available"
                      }
                      title={t("Support Email")}
                    />
                  </li>
                </ul>
              </div>
              <div className="px-6 pt-6 pb-3">
                <h4 className="mb-4 font-medium font-sans text-muted-500 text-xs uppercase">
                  {t("Products")}
                </h4>

                <ul className="inner-list">
                  <OrderProductList products={order.products} />
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </Layout>
  );
};
export default OrderReceipt;

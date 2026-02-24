import { capitalize, debounce } from "lodash";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BackButton } from "@/components/elements/base/button/BackButton";
import Button from "@/components/elements/base/button/Button";
import Card from "@/components/elements/base/card/Card";
import Select from "@/components/elements/form/select/Select";
import OrderDownloadOptions from "@/components/pages/user/store/order/OrderDownloadOptions/OrderDownloadOptions";
import OrderProductListAdmin from "@/components/pages/user/store/order/OrderProductListAdmin/OrderProductListAdmin";
import { OrderShippingAddressDetails } from "@/components/pages/user/store/order/OrderShippingAddressDetails";
import { OrderShippingAddressInputs } from "@/components/pages/user/store/order/OrderShippingAddressInputs";
import { OrderShippingDetails } from "@/components/pages/user/store/order/OrderShippingDetails";
import OrderUserInfo from "@/components/pages/user/store/order/OrderUserInfo/OrderUserInfo";
import Layout from "@/layouts/Default";
import $fetch from "@/utils/api";

interface Order {
  id: string;
  userId: string;
  status: string;
  shippingId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  productId: string | null;
  products: Product[];
  user: User;
  shippingAddress: ShippingAddress | null;
  shipping: Shipment | null;
}

interface Product {
  name: string;
  price: number;
  status: boolean;
  type: string;
  image: string;
  currency: string;
  walletType: string;
  category: Category;
  ecommerceOrderItem: EcommerceOrderItem;
}

interface Category {
  name: string;
}

interface EcommerceOrderItem {
  id: string;
  quantity: number;
  key: string | null;
  filePath: string | null;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
}

interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface Shipment {
  id: string;
  loadId: string;
  loadStatus: string;
  shipper: string;
  transporter: string;
  goodsType: string;
  weight: number;
  volume: number;
  description: string;
  vehicle: string;
  cost: number;
  tax: number;
  deliveryDate: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

const api = "/api/admin/ext/ecommerce/order";

const EcommerceOrders = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [order, setOrder] = useState<Order | null>(null);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  });
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>("");

  const handleShipmentAssignment = async () => {
    if (!selectedShipment) {
      toast.error("Please select a shipment");
      return;
    }

    const { data, error } = await $fetch({
      url: `${api}/${id}/shipment`,
      method: "PUT",
      body: {
        shipmentId: selectedShipment,
      },
      silent: true,
    });

    if (!error) {
      fetchOrder();
    }
  };

  const fetchOrder = async () => {
    const { data, error } = await $fetch({
      url: `${api}/${id}`,
      silent: true,
    });

    if (!error) {
      const orderData = data as any;
      setShipments(orderData.shipments);
      if (!orderData.order) return;
      setOrder(orderData.order);
      if (orderData.order.shippingAddress)
        setShippingAddress(orderData.order.shippingAddress);
      setOrderStatus(orderData.order.status); // Set initial order status
    }
  };

  const debounceFetchOrder = debounce(fetchOrder, 100);

  useEffect(() => {
    if (router.isReady) {
      debounceFetchOrder();
    }
  }, [router.isReady]);

  const handleShippingUpdate = async () => {
    const { data, error } = await $fetch({
      url: `${api}/${id}/shipping`,
      method: "PUT",
      body: {
        shippingAddress,
      },
      silent: true,
    });

    if (!error) {
      fetchOrder();
      setIsEditingShipping(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value;
    const { data, error } = await $fetch({
      url: `${api}/${id}`,
      method: "PUT",
      body: {
        status: newStatus,
      },
      silent: true,
    });

    if (!error) {
      setOrderStatus(newStatus);
      setOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  return (
    <Layout color="muted" title={`${t("Order")} ${id || "Loading"}`}>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-semibold text-xl dark:text-white">
          {t("Order")} {id} {t("Details")}
        </h1>
        <BackButton href="/admin/ext/ecommerce/order" />
      </div>
      {order ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="col-span-1 flex flex-col gap-4 md:col-span-8">
            <Card className="p-4">
              <OrderUserInfo order={order} />
              {order.products[0].type === "PHYSICAL" && (
                <div className="mb-4">
                  <h2 className="mb-2 font-semibold text-lg dark:text-white">
                    {t("Shipping Address")}
                  </h2>
                  {isEditingShipping ? (
                    <>
                      <OrderShippingAddressInputs
                        handleInputChange={handleInputChange}
                        shippingAddress={shippingAddress}
                      />
                      <div className="col-span-2 flex justify-end">
                        <Button
                          className="mt-4"
                          color="primary"
                          onClick={handleShippingUpdate}
                        >
                          {t("Update Shipping Address")}
                        </Button>
                        <Button
                          className="mt-4 ml-2"
                          color="muted"
                          onClick={() => setIsEditingShipping(false)}
                        >
                          {t("Cancel")}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div>
                      <OrderShippingAddressDetails
                        shippingAddress={shippingAddress}
                      />
                      {order.status === "PENDING" && (
                        <Button
                          className="mt-4"
                          color="primary"
                          onClick={() => setIsEditingShipping(true)}
                        >
                          {t("Edit Shipping Address")}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Card>

            {order.status === "PENDING" && (
              <div>
                <Card className="p-4">
                  {order.products[0].type === "PHYSICAL" ? (
                    order.shipping ? (
                      <>
                        <h2 className="mb-2 font-semibold text-lg dark:text-white">
                          {t("Shipment Details")}
                        </h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <OrderShippingDetails shipping={order.shipping} />
                        </div>
                      </>
                    ) : (
                      <>
                        <h2 className="mb-5 font-semibold text-lg dark:text-white">
                          {t("Assign Shipment")}
                        </h2>
                        <Select
                          onChange={(e) => setSelectedShipment(e.target.value)}
                          options={[
                            {
                              value: "",
                              label: capitalize(t("Select Shipment")),
                            },
                            ...shipments.map((shipment) => ({
                              value: shipment.id,
                              label: `${shipment.loadId} - ${shipment.shipper}`,
                            })),
                          ]}
                          value={selectedShipment || ""}
                        />
                        <div className="flex justify-end">
                          <Button
                            className="mt-4"
                            color="primary"
                            onClick={handleShipmentAssignment}
                          >
                            {t("Assign Shipment")}
                          </Button>
                        </div>
                      </>
                    )
                  ) : (
                    <OrderDownloadOptions
                      fetchOrder={fetchOrder}
                      order={order}
                      orderItem={order.products[0]?.ecommerceOrderItem}
                    />
                  )}
                </Card>
              </div>
            )}
          </div>
          <div className="col-span-1 md:col-span-4">
            <OrderProductListAdmin products={order.products} />
            {orderStatus === "PENDING" && (
              <Card className="mt-4 p-4">
                <h2 className="mb-4 font-semibold text-lg dark:text-white">
                  {t("Edit Order Status")}
                </h2>
                <Select
                  onChange={handleStatusChange}
                  options={[
                    { value: "COMPLETED", label: t("COMPLETED") },
                    { value: "CANCELLED", label: t("CANCELLED") },
                    { value: "REJECTED", label: t("REJECTED") },
                  ]}
                  value={orderStatus}
                />
              </Card>
            )}
          </div>
        </div>
      ) : (
        <p className="dark:text-gray-300">{t("Loading order details...")}</p>
      )}
    </Layout>
  );
};

export default EcommerceOrders;
export const permission = "Access Ecommerce Order Management";

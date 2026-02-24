"use client";
import { Icon } from "@iconify/react";
import { debounce } from "lodash";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BackButton } from "@/components/elements/base/button/BackButton";
import Button from "@/components/elements/base/button/Button";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import Card from "@/components/elements/base/card/Card";
import { Tab } from "@/components/elements/base/tab";
import Input from "@/components/elements/form/input/Input";
import { MashImage } from "@/components/elements/MashImage";
import ShippingAddressModal from "@/components/pages/ecommerce/ShippingAddressModal";
import { ProductDetails } from "@/components/pages/user/store/product/ProductDetails";
import { ProductReview } from "@/components/pages/user/store/product/ProductReview";
import Layout from "@/layouts/Default";
import { useDashboardStore } from "@/stores/dashboard";
import { useEcommerceStore } from "@/stores/user/ecommerce";
import { useWalletStore } from "@/stores/user/wallet";
import $fetch, { $serverFetch } from "@/utils/api";

interface Props {
  product: any;
  error?: string;
}

const ProductPage: React.FC<Props> = ({ product, error }) => {
  const { t } = useTranslation();

  const router = useRouter();
  const [amount, setAmount] = useState(1);
  const [discount, setDiscount] = useState<any>(null);
  const { profile, getSetting } = useDashboardStore();
  const {
    wishlist,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    wishlistFetched,
  } = useEcommerceStore();
  const { wallet, fetchWallet } = useWalletStore();
  const [mainTab, setMainTab] = useState("DESCRIPTION");

  const [showShippingModal, setShowShippingModal] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const tabs = [
    { value: "DESCRIPTION", label: "Description" },
    { value: "REVIEWS", label: "Reviews" },
  ];

  useEffect(() => {
    if (!error && router.isReady && !wishlistFetched) {
      fetchWishlist();
    }
  }, [error, router.isReady, wishlistFetched]);

  const fetchWalletData = async () => {
    await fetchWallet(product.walletType, product.currency);
  };

  useEffect(() => {
    if (!(error || wallet)) {
      fetchWalletData();
    }
  }, [error, wallet]);

  if (error) {
    return (
      <Layout title={t("Error")}>
        <div className="my-16 text-center">
          <h2 className="text-danger-500 text-xl">{t("Error")}</h2>
          <p className="mb-5 text-muted">{t(error)}</p>
          <Link href="/store">
            <Button>{t("Go back to store")}</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handleDiscount = async (code: string) => {
    const { data, error } = await $fetch({
      url: `/api/ext/ecommerce/discount/${product?.id}`,
      method: "POST",
      body: { code },
    });
    if (!error) {
      setDiscount(data);
    }
  };

  const debouncedDiscount = debounce(handleDiscount, 500);

  const handlePurchase = async () => {
    if (
      getSetting("ecommerceRestrictions") === "true" &&
      (!profile?.kyc?.status ||
        (Number.parseFloat(profile?.kyc?.level || "0") < 2 &&
          profile?.kyc?.status !== "APPROVED"))
    ) {
      await router.push("/user/profile?tab=kyc");
      toast.error(t("Please complete your KYC to purchase this product"));
      return;
    }

    if (product?.type !== "DOWNLOADABLE") {
      setShowShippingModal(true);
    } else {
      await finalizePurchase();
    }
  };

  const finalizePurchase = async () => {
    const { data, error } = await $fetch({
      url: "/api/ext/ecommerce/order",
      method: "POST",
      body: {
        productId: product?.id,
        discountId: discount?.id,
        amount,
        shippingAddress:
          product?.type !== "DOWNLOADABLE" ? shippingAddress : undefined,
      },
    });
    if (!error) {
      if (product) await fetchWallet(product.walletType, product.currency);
      router.push(`/user/store/${(data as any).id}`);
    }
  };

  const handleWishlistToggle = (product) => {
    if (wishlist.find((item) => item.id === product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <Layout color="muted" title={`${product.name}`}>
      <main>
        <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
          <h2 className="text-2xl">
            <span className="text-primary-500">{product.name}</span>{" "}
            <span className="text-muted-800 dark:text-muted-200">
              {t("Details")}
            </span>
          </h2>
          <BackButton href={`/store/${product.category.slug}`} />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3 lg:grid-cols-4">
          <div className="col-span-1 space-y-5 md:col-span-2 lg:col-span-3">
            <div className="relative h-[400px]">
              <MashImage
                alt={product?.name || "Product Image"}
                className="h-[400px] w-full rounded-lg object-cover"
                fill
                src={product?.image || "/img/placeholder.svg"}
              />
              {profile && (
                <div className="absolute top-5 right-5">
                  <IconButton
                    color={
                      wishlist.find((item) => item.id === product?.id)
                        ? "danger"
                        : "muted"
                    }
                    onClick={() => handleWishlistToggle(product)}
                    size={"sm"}
                    variant={"pastel"}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        wishlist.find((item) => item.id === product?.id)
                          ? "text-danger-500"
                          : "text-muted-300"
                      }`}
                      icon="mdi:heart"
                    />
                  </IconButton>
                </div>
              )}
            </div>
            <div className="flex gap-2 border-muted-200 border-b dark:border-muted-800">
              {tabs.map((tab) => (
                <Tab
                  color="primary"
                  key={tab.value}
                  label={tab.label}
                  setTab={setMainTab}
                  tab={mainTab}
                  value={tab.value}
                />
              ))}
            </div>
            <div className="flex h-full w-full flex-col">
              <div className="flex-1">
                {mainTab === "DESCRIPTION" ? (
                  <Card className="p-5" color="contrast">
                    <div
                      className="prose dark:prose-dark"
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  </Card>
                ) : (
                  <ProductReview />
                )}
              </div>
            </div>
          </div>
          <div className="col-span-1 space-y-5">
            <ProductDetails
              categoryName={product.category.name}
              product={product}
            />
            <Card
              className="flex flex-col justify-between text-muted-800 text-sm dark:text-muted-200"
              color="contrast"
            >
              <div className="w-full">
                <h3 className="px-5 py-3 font-semibold text-md">
                  {t("Purchase")}
                </h3>
                <ul className="flex flex-col gap-1">
                  <li className="flex justify-between border-muted-200 border-b px-5 pb-1 dark:border-muted-700">
                    <p className="text-muted-500 dark:text-muted-300">
                      {t("Balance")}
                    </p>
                    <span className="flex">
                      {wallet?.balance || 0} {product?.currency}
                      <Link href={"/user/wallet/deposit"}>
                        <Icon
                          className="h-5 w-5 text-success-500"
                          icon="ei:plus"
                        />
                      </Link>
                    </span>
                  </li>
                  <li className="flex justify-between border-muted-200 border-b px-5 pb-1 dark:border-muted-700">
                    <p className="text-muted-500 dark:text-muted-300">
                      {t("Discount")}
                    </p>
                    <span>{discount?.percentage ?? 0}%</span>
                  </li>
                  <li className="flex justify-between border-muted-200 border-b px-5 pb-1 dark:border-muted-700">
                    <p className="text-muted-500 dark:text-muted-300">
                      {t("Total to Pay")}
                    </p>
                    <span>
                      {product &&
                        product?.price -
                          (product?.price * (discount?.percentage ?? 0)) /
                            100}{" "}
                      {product?.currency}
                    </span>
                  </li>
                </ul>
                {product?.type !== "DOWNLOADABLE" && (
                  <div className="px-5 pt-4">
                    <Input
                      disabled={!wallet}
                      label={t("Amount")}
                      max={product?.inventoryQuantity}
                      min={1}
                      onChange={(e) =>
                        setAmount(Number.parseInt(e.target.value))
                      }
                      placeholder={t("Enter amount")}
                      type="number"
                      value={amount}
                    />
                  </div>
                )}
                <div className="px-5 pt-4">
                  <Input
                    label={t("Discount Code")}
                    onChange={(e) => {
                      debouncedDiscount(e.target.value);
                    }}
                    placeholder={t("Enter discount code")}
                    type="text"
                  />
                </div>
                <div className="px-5 pb-5">
                  <Button
                    className="mt-4 w-full"
                    color="primary"
                    disabled={
                      !(wallet && amount) ||
                      amount === 0 ||
                      (product ? amount > product?.inventoryQuantity : false) ||
                      (product
                        ? product.price -
                            (product.price * (discount?.percentage || 0)) /
                              100 >
                          wallet?.balance
                        : false)
                    }
                    onClick={() => handlePurchase()}
                    shape="rounded-sm"
                    type="button"
                  >
                    {t("Purchase")}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <ShippingAddressModal
        address={shippingAddress}
        onClose={() => setShowShippingModal(false)}
        onSubmit={() => {
          setShowShippingModal(false);
          finalizePurchase();
        }}
        open={showShippingModal}
        setAddress={setShippingAddress}
      />
    </Layout>
  );
};

export async function getServerSideProps(context: any) {
  const { productName } = context.params;
  try {
    const { data, error } = await $serverFetch(context, {
      url: `/api/ext/ecommerce/product/${productName}`,
    });

    if (error) {
      return {
        props: {
          error,
        },
      };
    }

    return {
      props: {
        product: data,
      },
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return {
      props: {
        error: `Error fetching product: ${error.message}`,
      },
    };
  }
}

export default ProductPage;

// pages/user/wishlist.tsx

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import type React from "react";
import { useEffect, useState } from "react";
import { BackButton } from "@/components/elements/base/button/BackButton";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import Card from "@/components/elements/base/card/Card";
import Tag from "@/components/elements/base/tag/Tag";
import Input from "@/components/elements/form/input/Input";
import { MashImage } from "@/components/elements/MashImage";
import Layout from "@/layouts/Default";
import { useEcommerceStore } from "@/stores/user/ecommerce";

const WishlistPage = () => {
  const { t } = useTranslation();
  const { wishlist, fetchWishlist, removeFromWishlist } = useEcommerceStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredProducts: Product[] =
    (wishlist &&
      wishlist.length > 0 &&
      wishlist.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.shortDescription
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      )) ||
    [];

  return (
    <Layout color="muted" title={t("Wishlist")}>
      <main>
        <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
          <h2 className="text-2xl">
            <span className="text-primary-500">{t("Your Wishlist")}</span>{" "}
            <span className="text-muted-800 dark:text-muted-200">
              {t("Products")}
            </span>
          </h2>

          <div className="flex w-full gap-2 text-end sm:max-w-xs">
            <Input
              icon={"mdi:magnify"}
              onChange={handleSearchChange}
              placeholder={t("Search Products...")}
              type="text"
              value={searchTerm}
            />
            <BackButton href={"/store"}>{t("Back to Store")}</BackButton>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-x-3 gap-y-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <div className="group relative" key={product.id}>
                <Link
                  href={`/store/${product.category.slug}/${product.slug.replace(
                    / /g,
                    "-"
                  )}`}
                >
                  <Card
                    className="group relative h-full w-full cursor-pointer p-3 hover:border-primary-500 hover:shadow-lg dark:hover:border-primary-400"
                    color="contrast"
                  >
                    <div className="relative h-[200px] w-full">
                      <MashImage
                        alt={product.name}
                        className="h-full w-full rounded-md bg-muted-100 object-cover dark:bg-muted-900"
                        height={200}
                        src={product.image || "/img/placeholder.svg"}
                        width={300}
                      />
                      <div className="absolute top-1 left-1">
                        <Tag color="primary">{product.category.name}</Tag>
                      </div>
                    </div>
                    <div className="mb-2">
                      <h4 className="font-medium text-muted-800 dark:text-muted-100">
                        {product.name}
                      </h4>
                      <p className="text-muted-500 text-xs dark:text-muted-400">
                        {product.shortDescription?.length > 100
                          ? product.shortDescription.slice(0, 100) + "..."
                          : product.shortDescription}
                      </p>
                    </div>
                    <div className="flex items-center justify-between divide-muted-200 dark:divide-muted-700">
                      <div className="pe-4">
                        <span className="font-bold text-md text-muted-800 dark:text-muted-100">
                          {product.price} {product.currency}
                        </span>
                      </div>
                      <Tag className="flex items-center" shape="full">
                        <span>{t("Rating")}</span>
                        <Icon
                          className={`h-3 w-3 text-warning-500 ${
                            product.rating === 0 ? "grayscale" : ""
                          }`}
                          icon="uiw:star-on"
                        />
                        <span className="text-muted-400 text-xs">
                          {product.rating.toFixed(1)} ({product.reviewsCount})
                        </span>
                      </Tag>
                    </div>
                  </Card>
                </Link>
                <div className="absolute top-5 right-5">
                  <IconButton
                    color={"danger"}
                    onClick={() => handleRemoveFromWishlist(product.id)}
                    size={"sm"}
                    variant={"pastel"}
                  >
                    <Icon
                      className="h-5 w-5 text-danger-500"
                      icon="mdi:heart"
                    />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="my-16 w-full text-center text-muted">
            <p>{t("Your wishlist is currently empty.")}</p>
          </div>
        )}
      </main>
    </Layout>
  );
};

export default WishlistPage;

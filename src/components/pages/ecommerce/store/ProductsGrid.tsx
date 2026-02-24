// components/pages/shop/ProductsGrid.tsx

import { Icon } from "@iconify/react";
import Link from "next/link";
import type React from "react";
import Button from "@/components/elements/base/button/Button";
import IconButton from "@/components/elements/base/button-icon/IconButton";
import Card from "@/components/elements/base/card/Card";
import Tag from "@/components/elements/base/tag/Tag";
import Input from "@/components/elements/form/input/Input";
import { MashImage } from "@/components/elements/MashImage";

interface Props {
  filteredProducts: any[];
  allCategoriesProducts: any[];
  searchTerm: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loadMore: () => void;
  wishlist: any[];
  handleWishlistToggle: (product: any) => void;
  profile: any;
  t: (key: string) => string;
  capitalize: (string: string) => string;
}

const ProductsGrid: React.FC<Props> = ({
  filteredProducts,
  allCategoriesProducts,
  searchTerm,
  handleSearchChange,
  loadMore,
  wishlist,
  handleWishlistToggle,
  profile,
  t,
  capitalize,
}) => {
  return (
    <div>
      <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
        <h2 className="text-2xl">
          <span className="text-primary-500">{capitalize("All")}</span>{" "}
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
        </div>
      </div>
      <div className="relative my-5">
        <hr className="border-muted-200 dark:border-muted-700" />
        <span className="absolute inset-0 -top-2 text-center font-semibold text-muted-500 text-xs dark:text-muted-400">
          <span className="bg-muted-50 px-2 dark:bg-muted-900">
            {searchTerm ? `Matching "${searchTerm}"` : "All Products"}
          </span>
        </span>
      </div>

      {/* Products */}
      {filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 gap-x-3 gap-y-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <div className="group relative" key={product.id}>
              <Link href={`/store/${product.category.slug}/${product.slug}`}>
                <Card
                  className="group relative h-full w-full cursor-pointer p-3 hover:border-primary-500 hover:shadow-lg dark:hover:border-primary-400"
                  color="contrast"
                >
                  <div className="relative h-[200px] w-full">
                    <MashImage
                      alt={product.slug}
                      className="h-full w-full rounded-md bg-muted-100 object-cover dark:bg-muted-900"
                      src={product.image || "/img/placeholder.svg"}
                    />
                    <div className="absolute top-1 left-1">
                      <Tag color="primary">
                        {product.category.name || "Uncategorized"}
                      </Tag>
                    </div>
                  </div>

                  <div className="my-2">
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
                    <div className="ms-2 flex items-center gap-2 text-muted-500 dark:text-muted-400">
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
                  </div>
                </Card>
              </Link>
              {profile && (
                <div className="absolute top-5 right-5">
                  <IconButton
                    color={
                      wishlist.find((item) => item.id === product.id)
                        ? "danger"
                        : "muted"
                    }
                    onClick={() => handleWishlistToggle(product)}
                    size={"sm"}
                    variant={"pastel"}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        wishlist.find((item) => item.id === product.id)
                          ? "text-danger-500"
                          : "text-muted-300"
                      }`}
                      icon="mdi:heart"
                    />
                  </IconButton>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {filteredProducts.length > 0 &&
        filteredProducts.length < allCategoriesProducts.length && (
          <div className="my-16 flex items-center justify-center">
            <Button
              className="flex items-center gap-2 rounded-lg bg-default px-4 py-2"
              onClick={loadMore}
              type="button"
            >
              <Icon className="h-4 w-4" icon="ph:dots-nine-bold" />
              <span>{t("Load more")}</span>
            </Button>
          </div>
        )}

      {filteredProducts.length === 0 && (
        <div className="my-16 w-full text-center text-muted-500 dark:text-muted-400">
          <h2>{t("No Products Available")}</h2>
          <p>{t("Sorry, there are no products available yet.")}</p>
        </div>
      )}
    </div>
  );
};

export default ProductsGrid;

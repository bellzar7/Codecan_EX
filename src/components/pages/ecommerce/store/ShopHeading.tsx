// components/pages/shop/ShopHeading.tsx

import type React from "react";
import { HeroParallax } from "@/components/ui/HeroParallax";
import { HeaderCardImage } from "@/components/widgets/HeaderCardImage";

interface Props {
  allCategoriesProducts: any[];
  profile: any | null;
  t: (key: string) => string;
}

const ShopHeading: React.FC<Props> = ({
  allCategoriesProducts,
  profile,
  t,
}) => {
  return allCategoriesProducts.length > 7 ? (
    <HeroParallax
      description={
        <>
          <span className="text-muted-500 dark:text-muted-400">
            {t("Explore our wide range of products")}
          </span>
          <br />
          <span className="text-muted-500 dark:text-muted-400">
            {t("and find the perfect one for you")}
          </span>
        </>
      }
      items={allCategoriesProducts.map((product) => ({
        title: product.name,
        link: `/store/${product?.category.slug}/${product.slug}`,
        thumbnail: product.image,
      }))}
      title={
        <>
          <span className="text-primary-500">
            {t("Welcome to our Online Store")}
          </span>
          <br />
        </>
      }
    />
  ) : (
    <div className="mb-5">
      <HeaderCardImage
        description={t(
          "Explore our wide range of products and find the perfect one for you"
        )}
        link={profile ? "/user/store" : undefined}
        linkLabel={t("View Your Orders")}
        lottie={{
          category: "ecommerce",
          path: "delivery",
          max: 2,
          height: 220,
        }}
        size="lg"
        title={t("Welcome to our Online Store")}
      />
    </div>
  );
};

export default ShopHeading;

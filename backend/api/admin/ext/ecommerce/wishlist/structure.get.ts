// /api/admin/ecommerceWishlists/structure.get.ts

import { models } from "@b/db";
import { structureSchema } from "@b/utils/constants";

export const metadata = {
  summary: "Get form structure for E-commerce Wishlists",
  operationId: "getEcommerceWishlistStructure",
  tags: ["Admin", "Ecommerce Wishlists"],
  responses: {
    200: {
      description: "Form structure for managing E-commerce Wishlists",
      content: structureSchema,
    },
  },
  permission: "Access Ecommerce Wishlist Management",
};

export const ecommerceWishlistStructure = async () => {
  const _users = await models.user.findAll();
  const products = await models.ecommerceProduct.findAll();

  const userId = {
    type: "input",
    label: "User",
    name: "userId",
    placeholder: "Enter the user ID",
    icon: "lets-icons:user-duotone",
  };

  const productId = {
    type: "select",
    label: "Product",
    name: "productId",
    options: products.map((product) => ({
      value: product.id,
      label: product.name,
    })),
    placeholder: "Select the product",
  };

  return {
    userId,
    productId,
  };
};

export default async (): Promise<object> => {
  const { userId, productId } = await ecommerceWishlistStructure();

  return {};
};

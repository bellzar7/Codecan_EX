import { models } from "@b/db";
import { createError } from "@b/utils/error";

import {
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { baseCategorySchema } from "../utils";

export const metadata: OperationObject = {
  summary: "Retrieves a specific ecommerce category by ID",
  description:
    "Fetches a single ecommerce category by its ID, including all active products in that category.",
  operationId: "getEcommerceCategoryById",
  tags: ["Ecommerce", "Categories"],
  parameters: [
    {
      name: "name",
      in: "path",
      required: true,
      schema: { type: "string", description: "Category name" },
    },
  ],
  responses: {
    200: {
      description: "Ecommerce category retrieved successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: baseCategorySchema,
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("Ecommerce Category"),
    500: serverErrorResponse,
  },
};

export default async (data: Handler) => {
  const { params } = data;

  const category = await models.ecommerceCategory.findOne({
    where: { name: params.name, status: true },
    include: [
      {
        model: models.ecommerceProduct,
        as: "ecommerceProducts",
        where: { status: true },
        attributes: [
          "id",
          "name",
          "description",
          "type",
          "price",
          "status",
          "image",
          "currency",
          "inventoryQuantity",
          "createdAt",
        ],
        include: [
          {
            model: models.ecommerceReview,
            as: "ecommerceReviews",
            attributes: [
              "id",
              "productId",
              "userId",
              "rating",
              "status",
              "createdAt",
            ],
          },
        ],
        order: [["name", "ASC"]],
      },
    ],
  });
  if (!category) {
    throw createError({ statusCode: 404, message: "Category not found" });
  }
  return category;
};

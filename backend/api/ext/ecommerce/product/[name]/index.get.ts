import { models } from "@b/db";
import { createError } from "@b/utils/error";

import {
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { baseProductSchema } from "../../utils";

export const metadata: OperationObject = {
  summary: "Retrieves a specific ecommerce product by ID",
  description:
    "Fetches a single ecommerce product by its ID, including details such as category and reviews.",
  operationId: "getEcommerceProductById",
  tags: ["Ecommerce", "Products"],
  parameters: [
    {
      name: "name",
      in: "path",
      required: true,
      schema: { type: "string", description: "Product name" },
    },
  ],
  responses: {
    200: {
      description: "Ecommerce product retrieved successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: baseProductSchema,
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("Ecommerce Product"),
    500: serverErrorResponse,
  },
};

export default async (data: Handler) => {
  const { user, params } = data;

  let included: any = [];
  if (user?.id) {
    included = [
      {
        model: models.ecommerceOrder,
        as: "orders",
        where: { userId: user.id },
        attributes: ["status"],
        required: false,
        through: {
          attributes: ["quantity", "filePath", "key"],
        },
      },
    ];
  }

  const product = await models.ecommerceProduct.findOne({
    where: { name: params.name, status: true },
    include: [
      {
        model: models.ecommerceCategory,
        as: "category",
        attributes: ["id", "name"],
      },
      {
        model: models.ecommerceReview,
        as: "ecommerceReviews",
        required: false,
        include: [
          {
            model: models.user,
            as: "user",
            attributes: ["id", "firstName", "lastName", "avatar"],
          },
        ],
      },
      ...included,
    ],
  });
  if (!product) {
    throw createError({ statusCode: 404, message: "Product not found" });
  }
  return product;
};

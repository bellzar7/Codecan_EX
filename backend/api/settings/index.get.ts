import { CacheManager } from "@b/utils/cache";
import {
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";

export const metadata = {
  summary: "Retrieves the application settings",
  description: "This endpoint retrieves the application settings.",
  operationId: "getSettings",
  tags: ["Settings"],
  requiresAuth: false,
  responses: {
    200: {
      description: "Application settings retrieved successfully",
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                key: {
                  type: "string",
                  description: "Setting key",
                },
                value: {
                  type: "string",
                  description: "Setting value",
                },
              },
            },
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("Settings"),
    500: serverErrorResponse,
  },
};

export default async () => {
  try {
    const cacheManager = CacheManager.getInstance();
    const settings = Array.from(
      (await cacheManager.getSettings()).entries()
    ).map(([key, value]) => ({ key, value }));
    let extensions = Array.from((await cacheManager.getExtensions()).keys());

    if (extensions?.length === 0) {
      extensions = [
        "extensions",
        "knowledge_base",
        "ecosystem",
        "ico",
        "forex",
        "ai_investment",
        "p2p",
        "staking",
        "mlm",
        "mailwizard",
        "ecommerce",
      ];
    }
    return {
      settings,
      extensions,
    };
  } catch (error) {
    console.error("Error fetching settings and extensions:", error);
    return serverErrorResponse;
  }
};

import { models } from "@b/db";
import {
  notFoundMetadataResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from "@b/utils/query";
import { baseTwdProviderSchema } from "../utils";

export const metadata = {
  summary: "Retrieves detailed information of a specific TWD provider by ID",
  operationId: "getTwdProviderById",
  tags: ["Admin", "TWD", "Provider"],
  parameters: [
    {
      index: 0,
      name: "id",
      in: "path",
      required: true,
      description: "ID of the TWD provider to retrieve",
      schema: { type: "string" },
    },
  ],
  responses: {
    200: {
      description: "TWD provider details",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: baseTwdProviderSchema,
          },
        },
      },
    },
    401: unauthorizedResponse,
    404: notFoundMetadataResponse("TWD Provider"),
    500: serverErrorResponse,
  },
  permission: "Access TWD Provider Management",
  requiresAuth: true,
};

export default async (data: Handler) => {
  const { params } = data;
  const { id } = params;

  const provider = await models.twdProvider.findOne({
    where: { id },
  });

  if (!provider) {
    throw new Error("TWD Provider not found");
  }

  // Test TwelveData API connection
  const apiKey = process.env.TWD_API_KEY;
  let connectionStatus = {
    status: false,
    message: "API key not configured",
  };

  if (apiKey) {
    try {
      const testUrl = `${process.env.TWD_BASE_URL || "https://api.twelvedata.com"}/time_series?symbol=AAPL&interval=1day&outputsize=1&apikey=${apiKey}`;
      const response = await fetch(testUrl);

      if (response.ok) {
        connectionStatus = {
          status: true,
          message: "API connection successful",
        };
      } else {
        const data = await response.json();
        connectionStatus = {
          status: false,
          message: data.message || "API connection failed",
        };
      }
    } catch (error) {
      connectionStatus = {
        status: false,
        message: `Connection error: ${error.message}`,
      };
    }
  }

  return {
    provider: provider.get({ plain: true }),
    connection: connectionStatus,
  };
};

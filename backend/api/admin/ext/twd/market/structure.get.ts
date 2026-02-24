import { structureSchema } from "@b/utils/constants";

export const metadata = {
  summary: "Get form structure for TWD Markets",
  operationId: "getTwdMarketStructure",
  tags: ["Admin", "TWD", "Market"],
  responses: {
    200: {
      description: "Form structure for managing TWD Markets",
      content: structureSchema,
    },
  },
  permission: "Access TWD Market Management",
};

export const twdMarketStructure = async () => {
  // isTrending and isHot are boolean fields
  const isTrending = {
    type: "select",
    label: "Trending",
    name: "isTrending",
    options: [
      { value: true, label: "Yes", color: "success" },
      { value: false, label: "No", color: "danger" },
    ],
    ts: "boolean",
  };

  const isHot = {
    type: "select",
    label: "Hot",
    name: "isHot",
    options: [
      { value: true, label: "Yes", color: "success" },
      { value: false, label: "No", color: "danger" },
    ],
    ts: "boolean",
  };

  return {
    isTrending,
    isHot,
  };
};

export default async () => {
  const { isTrending, isHot } = await twdMarketStructure();

  return {
    get: [],
    set: [],
    edit: [[isTrending, isHot]],
  };
};

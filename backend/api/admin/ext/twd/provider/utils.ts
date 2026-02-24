import { baseBooleanSchema, baseStringSchema } from "@b/utils/schema";

export const baseTwdProviderSchema = {
  id: baseStringSchema("ID of the TWD provider"),
  name: baseStringSchema("Name of the TWD provider"),
  title: baseStringSchema("Title of the TWD provider"),
  status: baseBooleanSchema("Status of the TWD provider"),
};

export const twdProviderSchema = {
  ...baseTwdProviderSchema,
};

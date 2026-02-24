import {
  baseDateTimeSchema,
  baseEnumSchema,
  baseNumberSchema,
  baseStringSchema,
} from "@b/utils/schema";

const id = baseStringSchema("ID of the Mailwizard Campaign");
const name = baseStringSchema("Campaign Name");
const subject = baseStringSchema("Campaign Subject");
const _status = baseEnumSchema("Campaign Status", [
  "PENDING",
  "PAUSED",
  "ACTIVE",
  "STOPPED",
  "COMPLETED",
  "CANCELLED",
]);
const speed = baseNumberSchema("Speed of email sending");
const targets = baseStringSchema(
  "Email targets for the campaign",
  10_000,
  0,
  true
);
const templateId = baseStringSchema("Associated template ID");
const _createdAt = baseDateTimeSchema("Creation date of the campaign");
const _updatedAt = baseDateTimeSchema("Last update date of the campaign", true);

export const mailwizardCampaignSchema = {
  id,
  name,
  subject,
  speed,
  templateId,
};

export const baseMailwizardCampaignSchema = {
  id,
  name,
  subject,
  speed,
  targets,
  templateId,
};

export const mailwizardCampaignUpdateSchema = {
  type: "object",
  properties: {
    name,
    subject,
    speed,
    templateId,
  },
  required: ["name", "subject", "speed", "templateId"],
};

export const mailwizardCampaignStoreSchema = {
  description: "Mailwizard Campaign created or updated successfully",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: mailwizardCampaignSchema,
      },
    },
  },
};

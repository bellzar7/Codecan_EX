import { models } from "@b/db";
import { createError } from "@b/utils/error";
import { handleNotification } from "@b/utils/notifications";
import { createRecordResponses } from "@b/utils/query";
import { Op } from "sequelize";
export const metadata: OperationObject = {
  summary: "Creates a new support ticket",
  description:
    "Creates a new support ticket for the currently authenticated user",
  operationId: "createTicket",
  tags: ["Support"],
  requiresAuth: true,
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            subject: {
              type: "string",
              description: "Subject of the ticket",
            },
            message: {
              type: "string",
              description: "Content of the ticket",
            },
            importance: {
              type: "string",
              description: "Importance level of the ticket",
              enum: ["LOW", "MEDIUM", "HIGH"],
            },
          },
          required: ["subject", "message", "importance"],
        },
      },
    },
  },

  responses: createRecordResponses("Support Ticket"),
};

export default async (data: Handler) => {
  const { body, user } = data;
  if (!user?.id) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const { subject, message, importance } = body;

  await models.supportTicket.create({
    userId: user.id,
    subject,
    messages: [
      {
        type: "client",
        text: message,
        time: new Date(),
        userId: user.id,
      },
    ],
    importance,
    status: "PENDING",
    type: "TICKET",
  });

  const admins = await models.user.findAll({
    raw: true,
    where: {
      id: {
        [Op.ne]: 4,
      },
    },
  });

  for (const admin of admins) {
    await handleNotification({
      userId: admin.id,
      title: "New support ticket Initiated",
      message: `Support Ticket with subject '${subject}' has been initiated`,
      type: "ACTIVITY",
    });
  }
  // await handleNotification({
  //   userId: user.id,
  //   title: "New support ticket Initiated",
  //   message: `Support Ticket with ${ user.firstName} ${user.lastName} has been initiated`,
  //   type: "ACTIVITY",
  // });
  return { message: "Ticket created successfully" };
};

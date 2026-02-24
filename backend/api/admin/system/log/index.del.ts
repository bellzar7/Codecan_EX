import { promises as fs } from "node:fs";
import { join } from "node:path";
import { crudParameters } from "@b/utils/constants";
import { commonBulkDeleteResponses } from "@b/utils/query";
import { sanitizePath } from "@b/utils/validation";

export const metadata = {
  summary: "Bulk deletes log entries by IDs",
  operationId: "bulkDeleteLogEntries",
  tags: ["Admin", "Logs"],
  parameters: crudParameters,
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            ids: {
              type: "array",
              items: { type: "string" },
              description: "Array of log entry IDs to delete",
            },
          },
          required: ["ids"],
        },
      },
    },
  },
  responses: commonBulkDeleteResponses("Log Entries"),
  requiresAuth: true,
  permission: "Access Log Monitor",
};

export default async (data: Handler) => {
  const { body, query } = data;
  const { ids } = body;
  const filter = query.filter ? JSON.parse(query.filter) : {};
  const date = filter.date || new Date().toISOString().split("T")[0];
  filter.date = undefined;

  const page = query.page ? Number.parseInt(query.page, 10) : 1;
  const perPage = query.perPage ? Number.parseInt(query.perPage, 10) : 10;

  // Sanitize the log file path to prevent LFI
  const sanitizedDate = sanitizePath(date);
  const logFilePath = join(process.cwd(), "logs", `${sanitizedDate}.log`);

  await bulkDeleteLogEntries(logFilePath, ids, page, perPage);
  return { message: "Log entries deleted successfully" };
};

async function bulkDeleteLogEntries(
  filePath: string,
  ids: string[],
  page: number,
  perPage: number
): Promise<void> {
  const data = await fs.readFile(filePath, { encoding: "utf8" });
  const logs = data.split("\n").filter((line) => line.trim());

  // Calculate actual indices in the original file
  const actualIndices = ids
    .map((id) => (page - 1) * perPage + Number.parseInt(id, 10))
    .sort((a, b) => b - a);

  for (const index of actualIndices) {
    if (index >= logs.length) {
      throw new Error("Log entry not found");
    }
    logs.splice(index, 1);
  }

  // Rewrite the file without the deleted entries
  const updatedContent = logs.join("\n");
  await fs.writeFile(filePath, updatedContent, { encoding: "utf8" });
}

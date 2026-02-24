import { BinaryOrderService } from "@b/api/exchange/binary/order/util/BinaryOrderService";
import { logError } from "../logger";

export async function processPendingOrders() {
  try {
    BinaryOrderService.processPendingOrders();
  } catch (error) {
    logError("processPendingOrders", error, __filename);
    throw error;
  }
}

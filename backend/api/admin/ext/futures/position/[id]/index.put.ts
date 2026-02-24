import { calculateUnrealizedPnl, scaleUp } from "@b/utils/futures/position";
import { getOrdersByUserId } from "@b/utils/futures/queries/order";
import { updatePositionInDB } from "@b/utils/futures/queries/positions";
import { updateRecordResponses } from "@b/utils/query";

export const metadata: OperationObject = {
  summary: "Updates a specific futures market",
  operationId: "updateFuturesMarket",
  tags: ["Admin", "Futures", "Markets"],
  parameters: [
    {
      index: 0,
      name: "id",
      in: "path",
      description: "ID of the futures market to update",
      required: true,
      schema: {
        type: "string",
      },
    },
  ],
  responses: updateRecordResponses("Futures Position"),
  requiresAuth: true,
  permission: "Access Futures Position Management",
};

export default async (data) => {
  const { body } = data;
  const orders = await getOrdersByUserId(body.userId);
  const orderToFind = orders.find((order) => order.id === body.orderId);
  // console.log('orderToFind',orderToFind);
  // console.log('body.entryPrice',body.entryPrice);
  // console.log('body.amount',body.amount);
  // console.log('body.leverage',body.leverage);
  const newAmount = scaleUp(body.amount);
  const newEntryPrice = scaleUp(body.entryPrice);

  if (orderToFind) {
    // console.log('order.leverage',orderToFind.leverage);
    // const testAmount = scaleDown(orderToFind.amount);
    // const testLeverage = scaleUp(orderToFind.leverage);
    // let finalLeverage = scaleDown(testLeverage);
    // let priceToScale;
    // if (finalLeverage === 0) {
    //   finalLeverage = 1;
    // }
    // console.log('newEntryPrice',newEntryPrice);
    // console.log('newAmount',newAmount);
    // console.log('testAmount',testAmount);
    // console.log('newAmounttestAmount',scaleUp(testAmount));

    const unrealizedPnl = calculateUnrealizedPnl(
      newEntryPrice,
      newAmount,
      orderToFind.price,
      body.side
    );
    // console.log('unrealizedPnl',unrealizedPnl);
    await updatePositionInDB(
      body.userId,
      body.id,
      newEntryPrice,
      newAmount,
      unrealizedPnl,
      body.stopLossPrice,
      body.takeProfitPrice,
      body.createdAt,
      body.updatedAt,
      body.leverage
    );
  }
};

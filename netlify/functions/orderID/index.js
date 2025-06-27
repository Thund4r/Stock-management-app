//netlify doesn't support fully support REST APIs. This should really go under the orders directory.

import { ddbDocClient } from "../orders/ddbDocClient.js";
import { GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

export const factoryHttpRes = (statCode, success, message, error) => {
  return {
    statusCode: statCode,
    body: JSON.stringify({
      success: success,
      message: message,
      error: error,
    }),
  };
};

export const handler = async (event) => {
  switch (event.httpMethod) {
    case "GET":
  try {
    const orderID = event.queryStringParameters.id;

    const orderParams = {
      TableName: "OrderDB",
      Key: {
        orderID: orderID,
      },
    };
    const orderResponse = await ddbDocClient.send(new GetCommand(orderParams));
    if (!orderResponse.hasOwnProperty("Item")) {
      return factoryHttpRes(400, "False, invalid ID", "", "True, Cannot render page as the orderDB does not contain an entry with the specified order ID");
    }

    const cartParams = {
      TableName: "OrderCartDB",
      Key: {
        orderID: orderID,
      },
    };
    const cartResponse = await ddbDocClient.send(new GetCommand(cartParams));

    const combinedResponse = {
      ...orderResponse.Item,
      cart: cartResponse?.Item?.cart || [],
    };

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: "True, successfully retrieved order and cart",
        message: "The API returned order and cart data",
        error: "False",
        items: combinedResponse,
      }),
    };
  } catch (err) {
    console.log("Error during get request in orderID API", err);
    return factoryHttpRes(500, "False", "Error occured when getting data for a specific order", "Internal server error");
  }
  }
};

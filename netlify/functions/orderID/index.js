//netlify doesn't support fully support REST APIs. This should really go under the orders directory.

import { ddbDocClient } from "../orders/ddbDocClient.js";
import { GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

export const factoryHttpRes = (statCode, success, message, error) => {
  return{
      statusCode: statCode,
      body: JSON.stringify({
          success: success,
          message: message,
          error: error
      })
  }
}


export const handler = async (event) => {
  switch (event.httpMethod) {
    case "GET":
      try {
        const orderID = event.queryStringParameters.id;
        const getParam = {
          TableName: "OrderDB",
          Key: {
            orderID: orderID,
          },
        };
        const response = await ddbDocClient.send(new GetCommand(getParam));
        if (!response.hasOwnProperty("Item")) {
          return factoryHttpRes(400, "False, invalid ID", "", "True, Cannot render page as the orderDB does not contain an entry with the specified order ID");
        }

        return {
          statusCode: 200,
          body: JSON.stringify({
            success: "True, successfully retrieved order from OrderDB",
            message: "The API returned the specified order's attributes",
            error: "False",
            items: response.Item,
          }),
        };
      } catch (err) {
        console.log("Error during get request in orderID API", err);
        return factoryHttpRes(500, "False", "Error occured when getting data for a specific order", "Internal server error");
      }
  }
};

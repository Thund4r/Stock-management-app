import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "./ddbDocClient.js";

/**
 * 
 */
export const handler = async (event) => {
  const params = {
    TableName: "CartDB",
    Key: {
      CustomerID: event.CustomerID
    },
  };

  try {
    console.log("Getting user cart...");
    const data = await ddbDocClient.send(new GetCommand(params));
    console.log("Retrieved cart:", JSON.stringify(data, null, 2));
    console.log("Event:", event)
    return {
      statusCode: 123,
      body: JSON.stringify(data.Item)
    }
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify(err)
    }
  }
};
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "./ddbDocClient.js";

/**
 * 
 */
export const handler = async (event) => {
  const params = {
    TableName: "CartDB",
    Item: event.Product,
  };

  try {
    console.log("Adding to cart...");
    const data = await ddbDocClient.send(new PutCommand(params));
    console.log("Added to cart:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
};
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "./ddbDocClient.js";

/**
 * 
 */
export const handler = async (event) => {
  const params = {
    TableName: "CartDB",
    Item: JSON.parse(event.body).Product,
  };

  try {
    console.log("Adding to cart...");
    console.log(JSON.parse(event.body).Product);
    const data = await ddbDocClient.send(new PutCommand(params));
    console.log("Added to cart:", JSON.stringify(data, null, 2));
    return {
      statusCode: data.$metadata.httpStatusCode,
      body: JSON.stringify(data)
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify(err)
    };
  }
};
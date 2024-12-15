import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "./ddbDocClient.js";

/**
 * 
 */
export const handler = async (event) => {
  payload = JSON.parse(event.body);
  const params = {
    TableName: "CartDB",
    KeyConditionExpression: "CustomerID = :c",
    ExpressionAttributeValues: {
        ":c": payload.CustomerID
    },
  };

  try {
    console.log("Getting user cart...");
    console.log(params);
    const data = await ddbDocClient.send(new QueryCommand(params));
    console.log("Retrieved cart:", data.Items);
    
    return {
      statusCode: 200,
      body: JSON.stringify(data.Items)
    }
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify(err)
    }
  }
};
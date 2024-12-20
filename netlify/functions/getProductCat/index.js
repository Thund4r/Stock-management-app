import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "./ddbDocClient.js";

/**
 * 
 */
export const handler = async (event) => {
  payload = JSON.parse(event.body);
  const params = {
    TableName: "ProductsDB",
    KeyConditionExpression: "Category = :c",
    ExpressionAttributeValues: {
        ":c": payload.Category
    },
  };
  
  try {
    console.log("Getting products...");
    console.log(params);
    const data = await ddbDocClient.send(new QueryCommand(params));
    console.log("Retrieved products:", data.Items);
    
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
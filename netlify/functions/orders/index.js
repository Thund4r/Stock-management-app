import {
  TransactWriteCommand,
  TransactGetCommand,
  TransactUpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "./ddbDocClient.js";
import { factoryHttpRes } from "utility/Utils.js";
import { GetItemCommand } from "@aws-sdk/client-dynamodb";

// payload of information sent to orderDB from customer side.
// --------------------------------------
// const payload = {
//   custName: "fake",
//   cart: [{
//       productName: "test product name 1",
//       productQty: 5,
//       pricePerPiece: 5
//       }, {
//       productName: "test product name 2",
//       productQty: 2,
//       pricePerPiece: 10
//       }],
//   delivDate: "1/1/2003",
//   outName:"TN1",
// }
// --------------------------------------

const totalPriceCalc = (cart) => {
  let totalPrice = 0;
  for (const product of cart) {
    totalPrice += product.productQty * product.pricePerPiece;
  }
  return totalPrice;
};

//This is how you're supposed declare the function for AWS Lambda to know which function to use when the API is called.
export const handler = async (event) => {
  //the .httpmethod attribute only exists because AWS Lambda defines that attribute for the event object it passes into the handler function when it calls it.
  switch (event.httpMethod) {
    case "POST":
      console.log(Date.now());
      console.log("fetch received. Executing POST request...");
      if (event.headers["content-type"] !== "application/json") {
        return factoryHttpRes(
          415,
          "False, unsupported media type",
          "Ensure the headers object has the appropriate header",
          "Content-Type must be application/json"
        );
      }
      console.log("Parsing JSON to JS object...");
      const orderData = JSON.parse(event.body);

      console.log("Running validation logic...");
      //validates payload data
      //To do: make sure to check if you are given a string containing just blank spaces (technically not empty but not useful)
      for (const [key, value] of Object.entries(orderData)) {
        if (typeof value !== "string" && !Array.isArray(value)) {
          return factoryHttpRes(
            400,
            "False, received data was malformed",
            "Ensure payload only contains string data type or array objects",
            "Payload: Non-string data type and non-array object found"
          );
        }

        if (typeof value === "string" && value.length === 0) {
          return factoryHttpRes(
            400,
            "False, received data was malformed",
            "Ensure all string fields contain at least one character",
            "Payload: One or more string field is of zero-length length"
          );
        } else if (Array.isArray(value) && value.length === 0) {
          return factoryHttpRes(
            400,
            "False, received data was malformed",
            "Cart must must contain one item at least",
            "payload: Cart array is of zero length"
          );
        }
      }

      //validate data in cart property
      //To do: make sure to check if you are given a string containing just blank spaces (technically not empty but not useful)
      for (const plain_obj of orderData.cart) {
        for (const [key, value] of Object.entries(plain_obj)) {
          if (typeof value !== "string" && typeof value !== "number") {
            return factoryHttpRes(
              400,
              "False, received data was malformed",
              "Cart must consist of only string or numerical data type",
              "Cart: unsupported data type in cart"
            );
          }

          if (typeof value === "string" && value.length === 0) {
            return factoryHttpRes(
              400,
              "False, received data was malformed",
              "Ensure all string fields contain at least one character",
              "Payload: One or more string field is of zero-length length"
            );
          } else if (typeof value === "number" && value <= 0) {
            return factoryHttpRes(
              400,
              "False, received data was malformed",
              "Cart must must contain one item at least",
              "payload: Cart array is of zero length"
            );
          }
        }
      }

      /*
      1. get all the counts from each database in a single try catch using strong consistent read
      2. construct params for each of the item for each database 
      3. call putcommand(param) and use the conditionalexpression to ensure the ID does not exist in a single try catch. handle if an ID already exists in the catch (essentialyl we terminate the API call)
      4. construct param to target the count in each database
      5. call updateitem(param) to update each item in database - handle if an item does not update 
      */

      //construct objs to get count from DBs
      let countOrderDB;
      let countOrderCartDB;
      let countOrderArchiveDB;

      try {
        //construct param to be used as a way of retrieving values from multiple tables in one atomic operation
        const GetParam = {
          TransactItems: [
            {
              Get: {
                TableName: "OrderDB",
                Key: {
                  orderID: "count",
                },
                ConsistentRead: true,
                ConditionExpression: "attribute_exists(orderID)",
              },
            },
            {
              Get: {
                TableName: "OrderCartDB",
                Key: {
                  orderID: "count",
                },
                ConsistentRead: true,
              },
            },
            {
              Get: {
                TableName: "OrderArchiveDB",
                Key: {
                  orderID: "count",
                },
                ConsistentRead: true,
                ConditionExpression: "attribute_exists(orderID)",
              },
            },
          ],
        };

        const responseGet = await ddbDocClient.send(
          new TransactGetCommand(GetParam)
        );

        const index_orderDB = 0;
        const index_orderCartDB = 1;
        const index_orderArchiveDB = 2;

        countOrderDB = responseGet.Responses[index_orderDB].Item.value;
        countOrderCartDB = responseGet.Responses[index_orderCartDB].Item.value;
        countOrderArchiveDB =
          responseGet.Responses[index_orderArchiveDB].Item.value;
      } catch (err) {
        //figure out what the error is then return a relevant http response to the user. We want to end execution the second an error occurs
        console.log("In Get, Error exception thrown:", err);
      }

      try {
        //construct param to be used as a way to write (post and update) to multiple tables in one atomic operation
        const WriteParam = {
          TransactItems: [
            {
              Put: {
                TableName: "OrderDB",
                Item: {
                  orderID: countOrderDB.toString(), //might have to conv to string or it could be that countOrderDB is a string
                  customerName: orderData.custName,
                  deliveryDate: orderData.delivDate,
                  deliveryStatus: "Pending", //set by default - user has to manually change
                  outletName: orderData.outName,
                  totalPrice: totalPriceCalc(orderData.cart),
                },
                ConditionExpression: "attribute_not_exists(orderID)",
              },
            },
            {
              Put: {
                TableName: "OrderCartDB",
                Item: {
                  orderID: countOrderCartDB.toString(), //might have to conv to string or it could be that countOrderDB is a string
                  cart: orderData.cart,
                },
                ConditionExpression: "attribute_not_exists(orderID)",
              },
            },
            {
              Put: {
                TableName: "OrderArchiveDB",
                Item: {
                  orderID: countOrderArchiveDB.toString(), //might have to conv to string or it could be that countOrderDB is a string
                  customerName: orderData.custName,
                  deliveryDate: orderData.delivDate,
                  deliveryStatus: "Pending", //set by default - user has to manually change
                  outletName: orderData.outName,
                  totalPrice: totalPriceCalc(orderData.cart),
                },
                ConditionExpression: "attribute_not_exists(orderID)",
              },
            },
            {
              Update: {
                TableName: "OrderDB",
                Key: {
                  orderID: "count",
                },
                UpdateExpression: "SET #val = #val + :inc",
                ExpressionAttributeNames: { "#val": "value" }, //value is a reserved word in AWS SDK so we must use a placeholder to reference the value attribute in our table
                ExpressionAttributeValues: { ":inc": 1 },
                ConditionExpression: "attribute_exists(orderID)",
              },
            },
            {
              Update: {
                TableName: "OrderCartDB",
                Key: {
                  orderID: "count",
                },
                UpdateExpression: "SET #val = #val + :inc",
                ExpressionAttributeNames: { "#val": "value" },
                ExpressionAttributeValues: { ":inc": 1 },
                ConditionExpression: "attribute_exists(orderID)",
              },
            },
            {
              Update: {
                TableName: "OrderArchiveDB",
                Key: {
                  orderID: "count",
                },
                UpdateExpression: "SET #val = #val + :inc",
                ExpressionAttributeNames: { "#val": "value" },
                ExpressionAttributeValues: { ":inc": 1 },
                ConditionExpression: "attribute_exists(orderID)",
              },
            },
          ],
        };

        const responseWrite = await ddbDocClient.send(
          new TransactWriteCommand(WriteParam)
        );
      } catch (err) {
        //figure out what the error is then return relevent http response to the user. We want to end execution the second an error occurs
        console.log("In write, i am going to print the error:", err);
      }

      //figure out how you can implement the auto delete at 500 messages saved in orderDB

      return factoryHttpRes(200, "msg", "msg");
    case "GET":
  }
};

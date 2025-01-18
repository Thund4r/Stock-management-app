import { TransactWriteCommand, TransactGetCommand, TransactUpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "./ddbDocClient.js";
import { factoryHttpRes } from "utility/Utils.js";
import { TransactionCanceledException, DynamoDBServiceException } from "@aws-sdk/client-dynamodb";
import { update } from "lodash";

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

//generates a list of objects within the range of the given primary keys to delete
const createOrderDeleteList = (bottomRange, topRange) => {
  transactWriteList = [];
  for (let num = bottomRange; num <= topRange; num++) {
    const obj = {
      Delete: {
        TableName: "OrderDB",
        Key: {
          orderID: num.toString(),
        },
        ConditionExpression: "attribute_exists(orderID)",
      },
    };
    transactWriteList.push(obj);
  }
  return transactWriteList;
};

//This is how you're supposed declare the function for AWS Lambda to know which function to use when the API is called.
export const handler = async (event) => {
  //the .httpmethod attribute only exists because AWS Lambda defines that attribute for the event object it passes into the handler function when it calls it.
  switch (event.httpMethod) {
    //test this method to see if it works as you expect it to.
    case "POST":
      console.log(Date.now());
      console.log("fetch received. Executing POST request...");
      if (event.headers["content-type"] !== "application/json") {
        return factoryHttpRes(415, "False, unsupported media type", "Ensure the headers object has the appropriate header", "Content-Type must be application/json");
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
          return factoryHttpRes(400, "False, received data was malformed", "Ensure all string fields contain at least one character", "Payload: One or more string field is of zero-length length");
        } else if (Array.isArray(value) && value.length === 0) {
          return factoryHttpRes(400, "False, received data was malformed", "Cart must must contain one item at least", "payload: Cart array is of zero length");
        }
      }

      //validate data in cart property
      //To do: make sure to check if you are given a string containing just blank spaces (technically not empty but not useful)
      for (const plain_obj of orderData.cart) {
        for (const [key, value] of Object.entries(plain_obj)) {
          if (typeof value !== "string" && typeof value !== "number") {
            return factoryHttpRes(400, "False, received data was malformed", "Cart must consist of only string or numerical data type", "Cart: unsupported data type in cart");
          }

          if (typeof value === "string" && value.length === 0) {
            return factoryHttpRes(400, "False, received data was malformed", "Ensure all string fields contain at least one character", "Payload: One or more string field is of zero-length length");
          } else if (typeof value === "number" && value <= 0) {
            return factoryHttpRes(400, "False, received data was malformed", "Cart must must contain one item at least", "payload: Cart array is of zero length");
          }
        }
      }

      //construct objs to get count from DBs
      let countOrder;
      let countOrderCart;
      let countOrderArchive;
      let totalOrderInOrderDB;

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
                TableName: "OrderDB",
                Key: {
                  orderID: "totalOrder",
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
                ConditionExpression: "attribute_exists(orderID)",
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

        const responseGet = await ddbDocClient.send(new TransactGetCommand(GetParam));

        const indices = {
          orderCount: 0,
          totalOrder: 1,
          cartCount: 2,
          archiveCount: 3,
        };

        countOrder = responseGet.Responses[indices.orderCount].Item.value;
        totalOrderInOrderDB = responseGet.Responses[indices.totalOrder].Item.value;
        countOrderCart = responseGet.Responses[indices.cartCount].Item.value;
        countOrderArchive = responseGet.Responses[indices.archiveCount].Item.value;
      } catch (err) {
        //figure out what the error is then return a relevant http response to the user. We want to end execution the second an error occurs
        console.log("In Get, Error exception thrown:", err);
      }


      const maxNumOrders = 500;
      if (totalOrderInOrderDB === maxNumOrders) {
        console.log("We are going to run delete operation");
        try {
          const updateTotalOrderObj = {
            Update: {
              TableName: "OrderDB",
              Key: {
                orderID: "totalOrder",
              },
              UpdateExpression: "SET #val = #val - :decrement",
              ExpressionAttributeNames: { "#val": "value" }, //value is a reserved word in AWS SDK so we must use a placeholder to reference the value attribute in our table
              ExpressionAttributeValues: { ":decrement": 50 },
              ConditionExpression: "attribute_exists(orderID)",
            },
          };
          const bottomRange = countOrder - 500; //bottom orderID to start deleting from
          const topRange = countOrder - 451; //top orderID as last deletion
          let deleteList = createOrderDeleteList(bottomRange,topRange);
          deleteList.push(updateTotalOrderObj)
          const writeParam = {
            TransactItems: deleteList
          };
          const responseWrite = await ddbDocClient.send(new TransactWriteCommand(writeParam));
          console.log(responseWrite)
        } catch (err) {
          console.error(err);
          return factoryHttpRes(500, "False", "Look at the server log to check error", "Internal server error");
        }
      }

      try {
        //construct param to be used as a way to write (post and update) to multiple tables in one atomic operation
        const writeParam = {
          TransactItems: [
            {
              Put: {
                TableName: "OrderDB",
                Item: {
                  orderID: countOrder.toString(),
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
                  orderID: countOrderCart.toString(),
                  cart: orderData.cart,
                },
                ConditionExpression: "attribute_not_exists(orderID)",
              },
            },
            {
              Put: {
                TableName: "OrderArchiveDB",
                Item: {
                  orderID: countOrderArchive.toString(),
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
                TableName: "OrderDB",
                Key: {
                  orderID: "totalOrder",
                },
                UpdateExpression: "SET #val = #val + :inc",
                ExpressionAttributeNames: { "#val": "value" },
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
        const responseWrite = await ddbDocClient.send(new TransactWriteCommand(writeParam));
      } catch (err) {
        console.error(err);
        return factoryHttpRes(500, "False", "Look at the server log to check error", "Internal server error");
      }

      return factoryHttpRes(200, "True", "Successfully added item to tables", "False");

    case "GET":
  }
};

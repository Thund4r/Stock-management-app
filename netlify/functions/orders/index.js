import { TransactWriteCommand, TransactGetCommand, ScanCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "./ddbDocClient.js";

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

//conforms to REST Convention but netlify doesn't support fully support REST APIs.

const totalPriceCalc = (cart) => {
  let totalPrice = 0;
  for (const product of cart) {
    totalPrice += product.quantity * product.price;
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

const getRidOfNonNumericPrimaryKey = (arr) => {
  let indicesToRemove = [];
  for (const obj of arr) {
    if (obj.hasOwnProperty("value")) {
      const index = arr.indexOf(obj);
      indicesToRemove.push(index);
    }
  }

  const filteredArr = arr.filter((_, index) => {
    return !indicesToRemove.includes(index);
  });

  //find the indexes of the objects we want to get rid of
  //Use filter to get rid of them, and return the new arr that only contains the appropriate objects
  // return arr;
  return filteredArr;
};

//This is how you're supposed declare the function for AWS Lambda to know which function to use when the API is called.
export const handler = async (event) => {
  //the .httpmethod attribute only exists because AWS Lambda defines that attribute for the event object it passes into the handler function when it calls it.
  
  switch (event.httpMethod) {
    //test this method to see if it works as you expect it to.
    case "POST":
      if (event.headers["content-type"] !== "application/json") {
        return factoryHttpRes(415, "False, unsupported media type", "Ensure the headers object has the appropriate header", "Content-Type must be application/json");
      }
      const orderData = JSON.parse(event.body);
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
        console.log(err);
        return factoryHttpRes(500, "False", "Error occured at the getting count and totalOrder values from tables ", "Internal server error");
      }

      //handles deleting oldest 50 entries when orderDB hits the allowed maximum number of orders
      const maxNumOrders = 500;
      if (totalOrderInOrderDB >= maxNumOrders) {
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
          let deleteList = createOrderDeleteList(bottomRange, topRange);
          deleteList.push(updateTotalOrderObj);
          const writeParam = {
            TransactItems: deleteList,
          };
          const responseWrite = await ddbDocClient.send(new TransactWriteCommand(writeParam));
        } catch (err) {
          console.error(err);
          return factoryHttpRes(500, "False", "Error occured at the auto deletion section for orderDB", "Internal server error");
        }
      }

      const dateOfCreation = new Intl.DateTimeFormat("en-MY", {
        timeZone: "Asia/Kuala_Lumpur",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date());


      //update these puts to include the new attributes. Also, have to figure out which DB the  new attributes are going to go into.
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
                  totalPrice: totalPriceCalc(orderData.cart),
                  dateOfCreation: dateOfCreation,
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
                  totalPrice: totalPriceCalc(orderData.cart),
                  dateOfCreation: dateOfCreation,
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
        for (const item of orderData.cart) {
          if (item.stock !== 9999) {
            writeParam.TransactItems.push({
              Update: {
                TableName: "ProductsDB",
                Key: {
                  Category: item.category,
                  Name: item.product,
                },
                UpdateExpression: "SET Stock = Stock - :qty",
                ExpressionAttributeValues: {
                  ":qty": item.quantity,
                },
                ConditionExpression: "Stock >= :qty",
              },
            });
          }
        };
        console.log("writeParam:", writeParam);
        const responseWrite = await ddbDocClient.send(new TransactWriteCommand(writeParam));
      } catch (err) {
        console.log("here's the error:", err);
        return factoryHttpRes(500, "False", "Error occured in putting and updating new entries section for tables", "Internal server error");
      }
      
      const order_items = orderData.cart.map((item) => `${item.product} (${item.quantity})`).join(", ");
      const payload = JSON.stringify({
        order_id: `#${countOrderArchive.toString()}`,
        order_items: order_items,
        order_delivery: orderData.delivDate,
        order_total: `RM ${totalPriceCalc(orderData.cart)}`,
        order_customer: orderData.custName,
        order_link: `${process.env.NEXT_PUBLIC_ROOT_PAGE}/admin/orders/${countOrderArchive.toString()}`,
        Phone: orderData.phone,
      });
      const responseConf = await fetch(`${process.env.NEXT_PUBLIC_ROOT_PAGE}/.netlify/functions/confirmation`, {
        method: "POST",
        body: payload,
      });


      return {
        statusCode: 200,
        body: JSON.stringify(`${countOrderArchive.toString()}`)
      };

    case "GET":
      let response;
      const query = new URLSearchParams(event.rawQuery);
      let customerName = query.get("customerName");
      let command
      console.log(customerName);
      if (customerName && customerName !== "null"){
        const params = {
          TableName: "OrderDB",
          IndexName: "customerName-orderID-index",
          KeyConditionExpression: "customerName = :n",
          ExpressionAttributeValues: {
              ":n": customerName,
          },
        };
        command = new QueryCommand(params);
      }
      else{
        //If customerName is not provided
        const params = {
          TableName: "OrderDB",
          ConsistentRead: true, //just added
        };
        command = new ScanCommand(params);
      }
      try {
        response = await ddbDocClient.send(command);
        console.log(response);
      } catch (err) {
        console.log(err);
        return factoryHttpRes(500, "False", "Error occured in retrieving all entries from orderDB", "Internal server error");
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: "True, successfully retrieved all orders from OrderDB",
          message: "This object contains a property referencing an array with all the orders from orderDB",
          error: "False",
          items: getRidOfNonNumericPrimaryKey(response.Items),
        }),
      };

    case "PUT":
      if (event.headers["content-type"] !== "application/json") {
        return factoryHttpRes(415, "False, unsupported media type", "Ensure the headers object has the appropriate header", "Content-Type must be application/json");
      }
      const updateData = JSON.parse(event.body);
      if (updateData.length === 0) {
        return factoryHttpRes(500, "False,", "The request body contains no attributes to update OrderDB and OrderArchiveDB with.", "Internal server error");
      }
      try {
        const writeParam = {
          TransactItems: updateData,
        };
        const responseWrite = await ddbDocClient.send(new TransactWriteCommand(writeParam));
        console.log("responseWrite:", responseWrite);
        return factoryHttpRes(200, "True", "Successfully modified attributes in dynamoDB", "False");
      } catch (err) {
        console.log("here's the error:", err);
        return factoryHttpRes(500, "False,", "Error occured when updating attributes in orderDB and orderArchiveDB", "Internal server error");
      }

    default:
      return factoryHttpRes(500, "false", "in default case", "true");
  }
};
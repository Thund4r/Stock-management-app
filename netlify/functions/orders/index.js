import { PutCommand, GetCommand, UpdateCommand} from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "./ddbDocClient.js";
import { factoryHttpRes } from "utility/Utils.js";



// payload of information sent to orderDB from customer side.
// --------------------------------------
// customer name - outlet's name
// cart object (array of product objects - each product object has attribute name, quantity, price per piece)
// Delivery/pickup date
// acronym outlet name.
// --------------------------------------


//This is how you're supposed declare the function for AWS Lambda to know which function to use when the API is called.
export const handler = async (event) => {

  //the .httpmethod attribute only exists because AWS Lambda defines that attribute for the event object it passes into the handler function when it calls it.
  switch (event.httpMethod){
    case 'POST':
      console.log("fetch received. Executing POST request...")
      if (event.headers["content-type"] !== "application/json"){
        return{
          statusCode: 415,
          body: JSON.stringify({
            success:"False, unsupported media type",
            message: "Ensure the headers object has the appropriate header",
            error: "Content-Type must be application/json"
          })
        }
      }
      console.log("Parsing JSON to JS object...")
      const orderData = JSON.parse(event.body)

      console.log("Running validation logic...")
      //validates payload data 
      //To do: make sure to check if you are given a string containing just blank spaces (technically not empty but not useful)
      for(const [key,value] of Object.entries(orderData)){
        if(typeof(value) !== "string" && !Array.isArray(value)){
          return {
            statusCode: 400,
            body: JSON.stringify({
              success: "False, received data was malformed",
              message: "Ensure payload only contains string data type or array objects",
              error: "Payload: Non-string data type and non-array object found"
            })
          }
        }

        if(typeof(value) === "string" && value.length === 0 ){
          return {
            statusCode: 400,
            body: JSON.stringify({
              success:"False, received data was malformed",
              message: "Ensure all string fields contain at least one character",
              error: "Payload: One or more string field is of zero-length length"
            })
          }
        }
        else if(Array.isArray(value) && value.length === 0){
          return {
            statusCode: 400,
            body: JSON.stringify({
              success:"False, received data was malformed",
              message: "Cart must must contain one item at least",
              error: "payload: Cart array is of zero length"
            })
          }
        }
      }

      //validate data in cart property
      //To do: make sure to check if you are given a string containing just blank spaces (technically not empty but not useful)
      for(const plain_obj of orderData.cart){
        for (const [key,value] of Object.entries(plain_obj)){
          if(typeof(value) !== "string" && typeof(value) !== "number"){
            return{
              statusCode: 400,
              body: JSON.stringify({
                message: "Cart must consist of only string or numerical data type",
                error: "Cart: unsupported data type in cart"
              })
            }
          }

          if(typeof(value) === "string" && value.length === 0){
            return{
              statusCode: 400,
              body: JSON.stringify({
                success:"False, received data was malformed",
                message: "Ensure all string fields contain at least one character",
                error: "Cart: One or more string field is of zero-length length"
              })
            }
          }
          else if(typeof(value) === "number" && value <= 0){
            return{
              statusCode: 400,
              body: JSON.stringify({
                success:"False, received data was malformed",
                message: "Ensure all numerical fields have a value of at least one",
                error: "Cart: One or more numerical field is zero or less"
              })
            }
          }
        }
      }


      /*
      get order total from orderIDCOunterDB
      Check the key from OrderDB with the same value as the order total. if it exists, respond with http error, else continue
      Parse event.body from JSON to JS object.
      Create suitable parameter variable from details in the JS object.
      Put request to the orderDB with conditionalexpression. If fail, respond with http error, else continue.
      Increment the order total from orderIDCounterDB. If it fails, respond with http error, else continue.
      return a success message.
      */ 

      const orderCounterParams = {
        TableName: "OrderIDCounterDB",
        Key:{
          Orders: "LatestOrderID"
        }
      }
      
      let latestOrdID = undefined
      try{
        const OrdCountResult = await ddbDocClient.send(new GetCommand(orderCounterParams))
        console.log("OrdCountResult:", OrdCountResult)
        if (!OrdCountResult.Item?.hasOwnProperty("Count")){
          //To do: implement some sort of logging method here instead of using console.log() for when you actually deploy servr.
          return {
            statusCode: 502,
            body: JSON.stringify({
              success:"False, an error occured on the server",
              message: "Check that the object returned by dynamoTable OrderIDCounterDB has the required properties",
              error: "Attempt to access required properties resulted in undefined"
            })
          }
        }
        else{
          latestOrdID = Number(OrdCountResult.Item.Count)
        }
      }
      catch(err){
        //To do: implement some sort of logging method here instead of using console.log() for when you actually deploy servr.
        console.log(err)
      }

      const LatestOrdParams = {
        TableName: "OrderDB",
        Key:{
          OrderID: latestOrdID
        },
        ConsistentRead: true // always gets us the most up to date count 
      }

      try{
        const latestOrdResult = await ddbDocClient.send(new GetCommand(LatestOrdParams))
        //checks if an order ID with the same count value exists already within OrderDB 
        if(latestOrdResult.hasOwnProperty("Item")){
          return {
            statusCode: 409,
            body: JSON.stringify({
              success: "false, database consistency error",
              message: "OrderIDCounterDB count conflicts with existing OrderDB entries",
              error: "The order count indicates a new order ID that already exists in OrderDB. Please verify database consistency."
            })
          }
        }
      }
      catch(err){
        //To do: implement some sort of logging method here instead of using console.log() for when you actually deploy servr.
        console.log(err)
      }

      const NewOrderParam = {
        TableName: "OrderDB",
        Item:{
          OrderID: latestOrdID,
          customerName: orderData.custName,
          cart: orderData.cart,
          deliveryDate: orderData.delivDate,
          outletName: orderData.outName
        },
        ConditionExpression: "attribute_not_exists(OrderID)"
      } 

      try{
        const response = await ddbDocClient.send(new PutCommand(NewOrderParam))
        responseHttpStatus = response['$metadata'].httpStatusCode
        if (responseHttpStatus < 200 || responseHttpStatus > 299){
          return {
            statusCode: 500,
            body: JSON.stringify({
              success: "false, order submission failed",
              message: "Please try again",
              error: "The order failed to be entered into OrderDB"
            })
          }
        }
      }
      catch(err){
        //To do: implement error logging for when we deploy server
        console.log(err)
      }

      //testing to see if this formatted such that i can update the correct attribute
      const nextOrdID = latestOrdID + 1 
      const updateOrderIDParam = {
        TableName: "OrderIDCounterDB",
        Key:{
          Orders: "LatestOrderID"
        },
        UpdateExpression: "set #c = :val",
        ExpressionAttributeNames: { "#c": "Count"},
        ExpressionAttributeValues: { ":val": (nextOrdID).toString()}
      }

      //testing to see if this updates the orderIDDB
      try{
        const response = await ddbDocClient.send(new UpdateCommand(updateOrderIDParam))
        console.log(response)
        // if (!response.ok){
        //   return {
        //     statusCode: 500,
        //     body: JSON.stringify({
        //       success: "",
        //       message: "",
        //       error: ""
        //     })
        //   }
        // }
      }
      catch(err){
        //To do: implement error logging for when we deploy server
        console.log(err)
      }

      return{
      statusCode: 202,
      body: JSON.stringify({
        success: "True, valid data received",
        message: "data was validated sucessfully",
        error: "N/A"
      })
    }
  }
}
  


      

import { PutCommand, GetCommand, UpdateCommand} from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "./ddbDocClient.js";
import { factoryHttpRes } from "utility/Utils.js";



// payload of information sent to orderDB from customer side.
// --------------------------------------
// customer name - outlet's name: 
// cart object (array of product objects - each product object has attribute name, quantity, price per piece) : 
// Delivery/pickup date :
// acronym outlet name: 
// delivery status: unfulfilled (by default)
// --------------------------------------


//This is how you're supposed declare the function for AWS Lambda to know which function to use when the API is called.
export const handler = async (event) => {

  //the .httpmethod attribute only exists because AWS Lambda defines that attribute for the event object it passes into the handler function when it calls it.
  switch (event.httpMethod){
    case 'POST':
      console.log("fetch received. Executing POST request...")
      if (event.headers["content-type"] !== "application/json"){
        return factoryHttpRes(415,"False, unsupported media type", "Ensure the headers object has the appropriate header" , "Content-Type must be application/json")
      }
      console.log("Parsing JSON to JS object...")
      const orderData = JSON.parse(event.body)

      console.log("Running validation logic...")
      //validates payload data 
      //To do: make sure to check if you are given a string containing just blank spaces (technically not empty but not useful)
      for(const [key,value] of Object.entries(orderData)){
        if(typeof(value) !== "string" && !Array.isArray(value)){
          return factoryHttpRes(400, "False, received data was malformed", "Ensure payload only contains string data type or array objects", "Payload: Non-string data type and non-array object found")
        }

        if(typeof(value) === "string" && value.length === 0 ){
          return factoryHttpRes(400, "False, received data was malformed", "Ensure all string fields contain at least one character", "Payload: One or more string field is of zero-length length")
        }
        else if(Array.isArray(value) && value.length === 0){
          return factoryHttpRes( 400, "False, received data was malformed", "Cart must must contain one item at least", "payload: Cart array is of zero length")
        }
      }

      //validate data in cart property
      //To do: make sure to check if you are given a string containing just blank spaces (technically not empty but not useful)
      for(const plain_obj of orderData.cart){
        for (const [key,value] of Object.entries(plain_obj)){
          if(typeof(value) !== "string" && typeof(value) !== "number"){
            return factoryHttpRes(400, "False, received data was malformed", "Cart must consist of only string or numerical data type" ,"Cart: unsupported data type in cart")
          }

          if(typeof(value) === "string" && value.length === 0){
            return factoryHttpRes(400, "False, received data was malformed", "Ensure all string fields contain at least one character", "Payload: One or more string field is of zero-length length")
          }
          else if(typeof(value) === "number" && value <= 0){
            return factoryHttpRes( 400, "False, received data was malformed", "Cart must must contain one item at least", "payload: Cart array is of zero length")
          }
        }
      }


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
          return factoryHttpRes(502, "False, an error occured on the server", "Check that the object returned by dynamoTable OrderIDCounterDB has the required properties", "Attempt to access required properties resulted in undefined" )
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
          return factoryHttpRes(409,  "false, database consistency error", "OrderIDCounterDB count conflicts with existing OrderDB entries", "The current order count from OrderIDCounterDB indicates a new order ID that already exists in OrderDB. Please verify database consistency.")
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
          outletName: orderData.outName,
          deliveryStatus: "unfulfilled" //by default unless explicitly edited by user on frontend
        },
        ConditionExpression: "attribute_not_exists(OrderID)"
      } 

      try{
        const response = await ddbDocClient.send(new PutCommand(NewOrderParam))
        responseHttpStatus = response['$metadata'].httpStatusCode
        if (responseHttpStatus < 200 || responseHttpStatus > 299){
          return factoryHttpRes(500 , "false, order submission failed", "Please try again", "The order failed to be entered into OrderDB")
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
        responseHttpStatus = response['$metadata'].httpStatusCode
        if (responseHttpStatus < 200 || responseHttpStatus > 299){
          return {
            statusCode: 500,
            body: JSON.stringify({
              success: "False",
              message: "An order was successfully made but updating order count in OrderIDCounterDB failed. Please manually update the count in AWS dynamoDB",
              error: "Updating OrderIDCounterDB failed"
            })
          }
        }
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
  


      

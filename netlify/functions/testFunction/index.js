import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "./ddbDocClient.js";

myData.then(function(data){ // .then() tells it to wait until the promise is resolved
    const pieceOfData = data['whatever'] // and THEN run the function inside
  })



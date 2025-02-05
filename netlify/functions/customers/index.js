import { QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "./ddbDocClient.js";

/**
 * 
 */
export const handler = async (event) => {

    let params;
    let command;
    switch (event.httpMethod){
        case "POST":
            return{
                statusCode: 400,
                body: "Not yet implemented"
            }
            //CHANGE TO PUT ITEM IN DB LATER
        
        case "GET":
            const query = new URLSearchParams(event.rawQuery);
            let name = query.get("name");
            let phone = query.get("phone");
            if (name && name !== "null") {
                console.log("Name provided")
                // When name is provided
                params = {
                    TableName: "CustomerDB",
                    KeyConditionExpression: "#name = :n",
                    ExpressionAttributeValues: {
                        ":n": name,
                    },
                    ExpressionAttributeNames: {
                        "#name": "Name", 
                    },
                };
                command = new QueryCommand(params);
            } 
            else {
                // When name is not provided
                params = {
                    TableName: "CustomerDB",
                };
                command = new ScanCommand(params);
            }
            
            try {
                console.log("Getting customers...");
                const data = await ddbDocClient.send(command);
                console.log("Retrieved customers:", data.Items);
                
                return {
                    statusCode: 200,
                    body: JSON.stringify(data.Items)
                }

            } 
            catch (err) {
                console.error(err);
                
                return {
                statusCode: 500,
                body: JSON.stringify(err)
                }
                
            }
        //implement PUT
        case "PUT": 
        
        default:
            console.log(event);
            return{
                statusCode: 500,
                body: "unrecognized HTTP Method, must be one of GET/POST/PUT/DELETE."
            }
    }
}
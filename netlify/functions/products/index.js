import { QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "./ddbDocClient.js";

/**
 * 
 */
export const handler = async (event, context) => {

    let params;
    let command;
    switch (event.httpMethod){
        case "POST":
            payload = JSON.parse(event.body);
            params = {
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
            };
            //CHANGE TO PUT ITEM IN DB LATER
        
        case "GET":
            const query = new URLSearchParams(event.rawQuery);
            console.log(query.get("name"));
            console.log(query.get("category"));
            let name = query.get("name");
            let category = query.get("category");
            if (category && category !== "null") {
                // When category is provided
                params = {
                    TableName: "ProductsDB",
                    KeyConditionExpression: "Category = :c",
                    ExpressionAttributeValues: {
                        ":c": category,
                    },
                };
                command = new QueryCommand(params);
            } 
            else {
                // When neither name nor category is provided
                params = {
                    TableName: "ProductsDB",
                };
                command = new ScanCommand(params);
            }
            
            try {
                console.log("Getting products...");
                console.log(params);
                const data = await ddbDocClient.send(command);
                console.log("Retrieved products:", data.Items);
                
                if (name && name !== "null") {
                    //Perform filtering
                    let items = data.Items.filter(item => item.Name.toLowerCase().includes(name.toLowerCase()));
                    return {
                        statusCode: 200,
                        body: JSON.stringify(items)
                        }
                }
                else {
                    return {
                        statusCode: 200,
                        body: JSON.stringify(data.Items)
                    }
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
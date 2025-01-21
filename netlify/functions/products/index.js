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
            let name = query.get("name");
            let category = query.getAll("category");
            let single = query.get("single");
            if (category && category.length !== 0) {
                console.log("Cat provided")
                // When category is provided
                const expressionValues = {};
                const placeholders = category.map((category, index) => {
                    const key = `:cat${index}`;
                    expressionValues[key] = category;
                    return key;
                });

                params = {
                    TableName: "ProductsDB",
                    FilterExpression: `Category IN (${placeholders.join(", ")})`,
                    ExpressionAttributeValues: expressionValues,
                };
                command = new ScanCommand(params);
            } 
            else if (single === "True" && name && name !== "null") {
                params = {
                    TableName: "ProductsDB",
                    IndexName: "Name-Category-index",
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
                // When category is not provided
                params = {
                    TableName: "ProductsDB",
                };
                command = new ScanCommand(params);
            }
            
            try {
                console.log("Getting products...");
                const data = await ddbDocClient.send(command);
                console.log("Retrieved products:", data.Items);
                
                if (name && name !== "null") {
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
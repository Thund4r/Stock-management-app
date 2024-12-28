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
            let name = query.get("name");
            let category = query.getAll("category");
            // if (name && name !== "null") {
            //     // When name is provided
            //     params = {
            //         TableName: "ProductsDB",
            //         FilterExpression: category && category !== "null" ? "Category = :c AND contains(#n, :n)" : "contains(#n, :n)",
            //         ExpressionAttributeValues: {
            //             ...(category && category !== "null" ? { ":c": category } : {}),
            //             ":n": name,
            //         },
            //         ExpressionAttributeNames: {
            //             "#n": "Name",
            //         },
            //     };
            //     command = new ScanCommand(params);
            // } 
            if (category && category[0] !== '') {
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
                console.log(params);
                command = new ScanCommand(params);
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
                console.log(params);
                const data = await ddbDocClient.send(command);
                console.log("Retrieved products:", data.Items);
                
                if (name && name !== "null") {
                    let items = data.Items.filter(item => item.Name.toLowerCase().includes(name.toLowerCase()));
                    return {
                        statusCode: 200,
                        body: JSON.stringify(items)
                        }
                }


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

        default:
            console.log(event);
            return{
                statusCode: 500,
                body: "unrecognized HTTP Method, must be one of GET/POST/PUT/DELETE."
            }
    }
}
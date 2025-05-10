import { BatchWriteCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "./ddbDocClient.js";

/**
 * 
 */

function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

export const handler = async (event) => {

    let params;
    let command;

    switch (event.httpMethod){
        case "POST":
            const product = JSON.parse(event.body);
            const chunks = chunkArray(product, 25);
            
            for (let chunk in chunks){
                console.log(chunks[chunk]);
                try{
                    params = {
                        ProductsDB: chunks[chunk].map((product) => {
                            const item = {
                                Name: product.Name,
                                Category: product.Category,
                            };
                        
                            if (product.Stock !== undefined) {
                                item.Stock = product.Stock;
                            }
                            else {
                                item.Stock = 9999;
                            };
                            if (product.Description !== undefined) {
                                item.Description = product.Description;
                            }else {
                                item.Description = "";
                            };
                            if (product.Price !== undefined) {
                                item.Price = product.Price;
                            }
                            else {
                                item.Price = 0;
                            };
                            
                            return {
                                PutRequest: {
                                    Item: item,
                                },
                            };
                        })
                    };
                    
                    response = await ddbDocClient.send(new BatchWriteCommand({RequestItems: params}));
                    console.log(await response);
                }
                catch (err) {
                    console.error(err);
                    
                    return {
                    statusCode: 500,
                    body: JSON.stringify(err)
                    }
                
                }
            }
            return{
                statusCode: 200,
                body: JSON.stringify(response)
            }
            
            
        
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
                console.log("Single product provided -------------------");
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
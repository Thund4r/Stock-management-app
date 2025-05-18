import { DeleteCommand, TransactWriteCommand, BatchWriteCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "./ddbDocClient.js";

/**
 * POST: Expects a list of products in the body.
 * GET: Takes a query string with the following parameters(of which are optional):
 * - name: The name of the product to search for.
 * - category: The category of the product to filter by.
 * - single: If set to "True", it will only return a single product with the specified name.
 * if no parameters are provided, a scan is performed.
 */

function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

export const handler = async (event) => {

    let product;
    let command;

    switch (event.httpMethod){
        case "POST":
            product = JSON.parse(event.body);
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
            }
            else {
                params = {
                    TableName: "ProductsDB",
                };
                command = new ScanCommand(params);
            }
            
            try {
                const data = await ddbDocClient.send(command);
                
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

        case "PUT": 
            product = JSON.parse(event.body);
            let delParams = null;
            if (Array.isArray(product) && product.length > 1) {
                // If product is an array and longer than 1
                // Do later ----------------------------------------------------!!!
            }
            else if (product.length === 1) {
                // If there is only 1 customer
                product = product[0];
                params = {
                    TransactItems: [{
                        Put: {
                        TableName: "ProductsDB",
                        Item: product,
                        }
                    }]
                };
                if (product.oldName !== product.newName || product.oldCategory !== product.Category) {
                    delParams = {
                        TableName: "ProductsDB",
                        Key: { Name: product.oldName, Category: product.oldCategory }
                    }
                }
            } 
            else {
                return{
                    statusCode: 500,
                    body: "Product must be provided."
                }
            }
            
            try {
                console.log(product);
                console.log("Updating products...");
                console.log(params)
                const data = await ddbDocClient.send(new TransactWriteCommand(params));
                console.log("Updated products:", data);
                if (delParams){
                    const data2 = await ddbDocClient.send(new DeleteCommand(delParams));
                }
                
                return {
                    statusCode: 200,
                    body: "JSON.stringify(data)"
                }

            } 
            catch (err) {
                console.error(err);
                
                return {
                statusCode: 500,
                body: JSON.stringify(err)
                }
                
            }
        
        default:
            console.log(event);
            return{
                statusCode: 500,
                body: "unrecognized HTTP Method, must be one of GET/POST/PUT/DELETE."
            }
    }
}
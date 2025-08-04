import { DeleteCommand, TransactWriteCommand, BatchWriteCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "./ddbDocClient.js";
import { bool } from "prop-types";

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
            try {
                const products = JSON.parse(event.body);
                console.log("Received products:", products);
                console.log(products.renameCategory && products.oldCategory && products.newCategory);
                if (products.renameCategory && products.oldCategory && products.newCategory) {
                    console.log(`Renaming category ${products.oldCategory} → ${products.newCategory}`);

                    const result = await ddbDocClient.send(new QueryCommand({
                        TableName: "ProductsDB",
                        KeyConditionExpression: "#cat = :oldCat",
                        ExpressionAttributeNames: { "#cat": "Category" },
                        ExpressionAttributeValues: { ":oldCat": products.oldCategory },
                    }));

                    const items = result.Items || [];
                    if (items.length === 0) {
                        return { statusCode: 404, products: `No items found in category ${products.oldCategory}` };
                    }
                    
                    const transactItems = [];

                    for (const item of items) {
                        transactItems.push({
                            Put: {
                                TableName: "ProductsDB",
                                Item: { ...item, Category: products.newCategory }
                            }
                        });
                        transactItems.push({
                            Delete: {
                                TableName: "ProductsDB",
                                Key: {
                                    Category: item.Category,
                                    Name: item.Name
                                }
                            }
                        });
                    }

                    console.log("Prepared transactItems:", transactItems);

                    const chunks = chunkArray(transactItems, 100);

                    for (const chunk of chunks) {
                        await ddbDocClient.send(new TransactWriteCommand({ TransactItems: chunk }));
                    }

                    return {
                        statusCode: 200,
                        body: `Renamed category from ${products.oldCategory} to ${products.newCategory}`
                    };
                }

                if (!Array.isArray(products) || products.length === 0) {
                    return {
                        statusCode: 400,
                        body: "Must provide an array of product objects.",
                    };
                }

                const transactItems = [];

                for (const item of products) {
                    if ("oldName" in item || "oldCategory" in item) {
                        const { oldName, oldCategory, ...newProduct } = item;

                        transactItems.push({
                            Put: {
                                TableName: "ProductsDB",
                                Item: newProduct,
                            },
                        });

                        if (oldName !== newProduct.Name || oldCategory !== newProduct.Category) {
                            transactItems.push({
                                Delete: {
                                TableName: "ProductsDB",
                                Key: {
                                    Name: oldName,
                                    Category: oldCategory,
                                },
                                },
                            });
                        }
                    } else if ("quantity" in item) {
                        const result = await ddbDocClient.send(new QueryCommand({
                        TableName: "ProductsDB",
                        IndexName: "Name-Category-index",
                        KeyConditionExpression: "#name = :n",
                        ExpressionAttributeNames: { "#name": "Name" },
                        ExpressionAttributeValues: { ":n": item.Name },
                        Limit: 1,
                        }));

                        const match = result.Items?.[0];
                        if (!match) {
                            return { statusCode: 404, body: `Product ${item.Name} not found.` };
                        }

                        if (match.Stock === 9999) continue;

                        transactItems.push({
                            Update: {
                                TableName: "ProductsDB",
                                Key: {
                                Name: match.Name,
                                Category: match.Category,
                                },
                                UpdateExpression: "SET Stock = Stock + :qty",
                                ConditionExpression: "Stock <> :max",
                                ExpressionAttributeValues: {
                                ":qty": item.quantity,
                                ":max": 9999,
                                },
                            },
                            });
                    } else {
                        return {
                            statusCode: 400,
                            body: "Each product must contain either edit keys or quantity.",
                        };
                    }
                }

                console.log("TransactWriteCommand params:", transactItems);
                const chunks = chunkArray(transactItems, 100);

                for (const chunk of chunks) {
                    await ddbDocClient.send(new TransactWriteCommand({ TransactItems: chunk }));
                }
                
                return {
                    statusCode: 200,
                    body: JSON.stringify(transactItems)
                };
            }
            catch (err) {
                return {
                    statusCode: 500,
                    body: JSON.stringify(err)
                };
            }

        case "DELETE":
            product = JSON.parse(event.body);
            params = {
                TableName: "ProductsDB",
                Key: { Category: product.Category, Name: product.Name }
            };
            try {
                console.log("Deleting product...");
                console.log(params)
                const data = await ddbDocClient.send(new DeleteCommand(params));
                console.log("Deleted product:", data);
                return {
                    statusCode: 200,
                    body: JSON.stringify(data)
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
            return{
                statusCode: 500,
                body: "unrecognized HTTP Method, must be one of GET/POST/PUT/DELETE."
            }
    }
}
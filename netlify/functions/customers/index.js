import { DeleteCommand, PutCommand, QueryCommand, ScanCommand, TransactWriteCommand} from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "./ddbDocClient.js";

/**
 * 
 */
export const handler = async (event) => {

    let params;
    let command;
    let query;
    let name;
    let phone;

    switch (event.httpMethod){
        case "POST":
            customer = JSON.parse(event.body);

            console.log(customer);
            params = {
                TableName: "CustomerDB",
                Item: {
                    Name: customer.name,
                    Address: customer.address,
                    Orders: [],
                    Phone: customer.phone,
                },
            }

            try{
                const data = await ddbDocClient.send(new PutCommand(params));
                return{
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
            
            //CHANGE TO PUT ITEM IN DB LATER
        
        case "GET":
            query = new URLSearchParams(event.rawQuery);
            name = query.get("name");
            phone = query.get("phone");
            nameOnly = query.get("nameOnly");
            if (name && name !== "null") {
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
            else if (nameOnly && nameOnly == "True"){
                params = {
                    TableName: "CustomerDB",
                    ProjectionExpression: "#name",
                    ExpressionAttributeNames: {
                        "#name": "Name", 
                    },
                };
                command = new ScanCommand(params);
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
        // case "PUT":
        //     if (event.headers["content-type"] !== "application/json") {
        //         return factoryHttpRes(415, "False, unsupported media type", "Ensure the headers object has the appropriate header", "Content-Type must be application/json");
        //     }
        //     const updateData = JSON.parse(event.body);
        //     console.log(updateData);
        //     try {
        //         const writeParam = {
        //         TransactItems: updateData,
        //         };
        //         const responseWrite = await ddbDocClient.send(new TransactWriteCommand(writeParam));
        //         return factoryHttpRes(200, "True", "Successfully modified attributes in dynamoDB", "False");
        //     } catch (err) {
        //         console.log(err);
        //         return factoryHttpRes(500, "False,", "Error occured when aupdating attributes in orderDB and orderArchiveDB", "Internal server error");
        //     }

        //     default:
        //     return factoryHttpRes(500, "false", "in default case", "true");
        // }
        // };

        case "PUT":
            customer = JSON.parse(event.body);
            let delParams = null;
            if (Array.isArray(customer) && customer.length > 1) {
                // If customer is an array and longer than 1
                // Do later ----------------------------------------------------!!!
            }
            else if (customer.length === 1) {
                // If there is only 1 customer
                params = {
                    TransactItems: [{ 
                        Update: {
                            TableName: "CustomerDB",
                            Key: { Name: customer[0].newName },
                            UpdateExpression: "SET #phone = :p, #address = :a, #orders = :o",
                            ExpressionAttributeValues: {
                                ":p": customer[0].phone,
                                ":a": customer[0].address,
                                ":o": customer[0].orders,
                            },
                            ExpressionAttributeNames: {
                                "#phone": "Phone", 
                                "#address": "Address", 
                                "#orders": "Orders"
                            },
                        }
                    }]
                }
                if (customer[0].newName !== customer[0].oldName){
                    delParams = {
                        TableName: "CustomerDB",
                        Key: { Name: customer[0].oldName }
                    }
                }
            } 
            else {
                // When name is not provided
                return{
                    statusCode: 500,
                    body: "Customer name must be provided."
                }
            }
            
            try {
                console.log("Updating customers...");
                console.log(params)
                const data = await ddbDocClient.send(new TransactWriteCommand(params));
                console.log("Updated customers:", data);
                if (delParams){
                    const data2 = await ddbDocClient.send(new DeleteCommand(delParams));
                }
                
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

        case "DELETE":
            customer = JSON.parse(event.body);
            console.log(customer);
            params = {
                TableName: "CustomerDB",
                Key: { Name: customer.name }
            };
            try {
                console.log("Updating customers...");
                console.log(params)
                const data = await ddbDocClient.send(new DeleteCommand(params));
                console.log("Updated customers:", data);
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
            console.log(event);
            return{
                statusCode: 500,
                body: "Unrecognized HTTP Method, must be one of GET/POST/PUT/DELETE."
            }
    }
}
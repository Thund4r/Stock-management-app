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

        case "PUT":
            customer = JSON.parse(event.body);
            let delParams = null;

            if (Array.isArray(customer) && customer.length > 1) {
                // TODO: Handle bulk case later
            }
            else if (customer.length === 1) {
                const item = customer[0];

                const putParams = {
                    TransactItems: [{
                        Put: {
                            TableName: "CustomerDB",
                            Item: {
                                Name: item.newName,
                                Phone: item.phone,
                                Address: item.address,
                                Orders: item.orders,
                            }
                        }
                    }]
                };

                if (item.newName !== item.oldName) {
                    delParams = {
                        TableName: "CustomerDB",
                        Key: { Name: item.oldName }
                    };
                }

                try {
                    console.log("Putting customer...");
                    const data = await ddbDocClient.send(new TransactWriteCommand(putParams));
                    console.log("Customer put:", data);

                    if (delParams) {
                        await ddbDocClient.send(new DeleteCommand(delParams));
                    }

                    return {
                        statusCode: 200,
                        body: JSON.stringify(data)
                    };
                }
                catch (err) {
                    console.error(err);
                    return {
                        statusCode: 500,
                        body: JSON.stringify(err)
                    };
                }
            } 
            else {
                return {
                    statusCode: 500,
                    body: "Customer name must be provided."
                };
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
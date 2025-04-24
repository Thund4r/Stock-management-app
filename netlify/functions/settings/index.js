import { DeleteCommand, GetCommand, PutCommand, QueryCommand, UpdateCommand} from "@aws-sdk/lib-dynamodb";
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
        // case "POST":
        //     customer = JSON.parse(event.body);

        //     console.log(customer);
        //     params = {
        //         TableName: "CustomerDB",
        //         Item: {
        //             Name: customer.name,
        //             Address: customer.address,
        //             Orders: [],
        //             Phone: customer.phone,
        //         },
        //     }

        //     try{
        //         const data = await ddbDocClient.send(new PutCommand(params));
        //         return{
        //             statusCode: 200,
        //             body: JSON.stringify(data)
        //         }
        //     }
        //     catch (err) {
        //         console.error(err);
                
        //         return {
        //         statusCode: 500,
        //         body: JSON.stringify(err)
        //         }
                
        //     }
            
        //     //CHANGE TO PUT ITEM IN DB LATER
        
        case "GET":
            query = new URLSearchParams(event.rawQuery);
            storeID = query.get("storeID");

            params = {
                TableName: "SettingsDB",
                Key: {
                    StoreID: storeID,
                }
            };
            command = new GetCommand(params);
            
            
            try {
                console.log("Getting settings...");
                const data = await ddbDocClient.send(command);
                console.log("Retrieved settings:", data.Item);
                
                return {
                    statusCode: 200,
                    body: JSON.stringify(data.Item)
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
            settings = JSON.parse(event.body);
            params = {
                TableName: "SettingsDB",
                Key: { 
                    StoreID: settings.StoreID 
                },
                UpdateExpression: "SET #phone = :p, #address = :a, #name = :n",
                ExpressionAttributeValues: {
                    ":p": settings.Phone,
                    ":a": settings.Address,
                    ":n": settings.Name,
                },
                ExpressionAttributeNames: {
                    "#phone": "Phone", 
                    "#address": "Address", 
                    "#name": "Name"
                },
            }

            try {
                console.log("Updating settings...");
                const data = await ddbDocClient.send(new UpdateCommand(params));
                console.log("Updated settings:", data);
                
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

        // case "DELETE":
        //     customer = JSON.parse(event.body);
        //     console.log(customer);
        //     params = {
        //         TableName: "CustomerDB",
        //         Key: { Name: customer.name }
        //     };
        //     try {
        //         console.log("Updating customers...");
        //         console.log(params)
        //         const data = await ddbDocClient.send(new DeleteCommand(params));
        //         console.log("Updated customers:", data);
        //         return {
        //             statusCode: 200,
        //             body: JSON.stringify(data)
        //         }

        //     } 
        //     catch (err) {
        //         console.error(err);
        //         return {
        //         statusCode: 500,
        //         body: JSON.stringify(err)
        //         }
                
        //     }
        
        default:
            console.log(event);
            return{
                statusCode: 500,
                body: "Unrecognized HTTP Method, must be one of GET/POST/PUT/DELETE."
            }
    }
}
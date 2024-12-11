import { InvokeCommand } from "@aws-sdk/client-lambda";
import { lambdaClient } from "./lambdaClient.js";

const addToCart = async () => {
    const name = document.getElementById("product").value;
    const quantity = document.getElementById("quantity").value;
    const customerID = parseInt(localStorage.getItem("CustomerID"));
    const params = {
        FunctionName: "addToCart",
        Payload: JSON.stringify({
            Product: {
                CustomerID: customerID,
                Name: name,
                Quantity: quantity
            },
            TableName: "CartDB"
        })
    };
    try {
        const data = await lambdaClient.send(new InvokeCommand(params));
        alert("Success. Data added to table.");
        console.log("Success, payload", params);
        getCart();
      } catch (err) {
        alert("Oops an error occurred.");
        console.log("Error", err);
      }
}

const getCart = async () => {
    const customerID = parseInt(localStorage.getItem('CustomerID'));
    const params = {
        CustomerID: customerID
    };
    //const cart = await lambdaClient.send(new InvokeCommand(params));
    console.log(params);
    const cart = await fetch("/.netlify/functions/getCart?parameter=${params}", {
        method: "POST",
        body: JSON.stringify(params),
    });
    //const responsePayload = JSON.parse(new TextDecoder("utf-8").decode(cart.Payload));
    //console.log(responsePayload);
    //console.log(JSON.parse(responsePayload.body));
    const response = await cart.json();
    console.log(response);
}

window.addToCart = addToCart;
window.getCart = getCart;
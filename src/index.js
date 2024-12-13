// import { InvokeCommand } from "@aws-sdk/client-lambda";
// import { lambdaClient } from "./lambdaClient.js";


const addToCart = async () => {
    const name = document.getElementById("product").value;
    const quantity = parseInt(document.getElementById("quantity").value, 10);
    const cart = JSON.parse(localStorage.getItem("cart"));
    const matchingProduct = cart.find(product => product.name === name);
    if (matchingProduct){
        matchingProduct.quantity = parseInt(matchingProduct.quantity, 10) + quantity;
    }
    else{
        cart.push({name,quantity});
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    console.log("Cart updated:", cart);
}

const getCart = async () => {
    cart = JSON.parse(localStorage.getItem("cart"));
    console.log("Cart retrieved:", cart);
}


// const addToCart = async () => {
//     const name = document.getElementById("product").value;
//     const quantity = document.getElementById("quantity").value;
//     const customerID = parseInt(localStorage.getItem("CustomerID"));
//     const params = {
//         FunctionName: "addToCart",
//         Payload: JSON.stringify({
//             Product: {
//                 CustomerID: customerID,
//                 Name: name,
//                 Quantity: quantity
//             },
//             TableName: "CartDB"
//         })
//     };
//     try {
//         const data = await lambdaClient.send(new InvokeCommand(params));
//         alert("Success. Data added to table.");
//         console.log("Success, payload", params);
//         getCart();
//       } catch (err) {
//         alert("Oops an error occurred.");
//         console.log("Error", err);
//       }
// }
//
// const getCart = async () => {
//     const customerID = parseInt(localStorage.getItem('CustomerID'));
//     const params = {
//         CustomerID: customerID
//     };
//     const cart = await fetch("/.netlify/functions/getCart", {
//         method: "POST",
//         body: JSON.stringify(params),
//     });
//     const response = await cart.json();
//     console.log(response);
// }

window.addToCart = addToCart;
window.getCart = getCart;
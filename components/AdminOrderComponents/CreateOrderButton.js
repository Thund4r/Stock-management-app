// payload of information sent to orderDB from admin side
// --------------------------------------
// customer name - outlet's name
// cart object (array of product objects - each product object has attribute name, quantity, price per piece). This corresponds to the "add item" button
// Delivery/pickup date
// acronym outlet name.
// --------------------------------------



/* for post request
1. upon clicking order button, we call a function that constructs a payload and calls a fetch req to the API.
2. The fetch request should contain the API to send the req to and an object containing options to configure the request in the 2nd parameter.
3. object body should contain a header - content type, body - for the payload (paylaod will be written in JS but stringified to convert to JSON) and the method - post.
*/

// used to test orders API - you should understand how this actually works under the hood (the use of recursive functions in tandem with async operations is tricky), it'll be good for you.
// function repeatWithDelay(callback, delay, times, count){
//     if (times <= 0) return;
    
//     console.log("count:", count)
//     console.log("The current date and time:", new Date().toLocaleString('en-US', { 
//         hour: 'numeric',
//         minute: 'numeric',
//         second: 'numeric',
//         hour12: false 
//     }))

//     setTimeout(async () => {
//       await callback();
//       repeatWithDelay(callback, delay, times - 1, count + 1);
//     }, delay);
//   }



async function sendPostReq(){
    const payload = {
        custName: "fake",
        cart: [{
            productName: "test product name 1",
            quantity: 5,
            price: 5 
            }, {
            productName: "test product name 2",
            quantity: 2,
            price: 10 
            }],
        delivDate: "1/1/2003",
        outName:"TN1", 
    }

    console.log("Constructed payload")
    console.log("About to send fetch request")


    try{
        //change back to orders after done testing using the test API
        const response = await fetch("../../.netlify/functions/orders", {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "content-type": "application/json"
            }
        })
        console.log("Here's the response:", response)
        console.log("Status code:", response.status)
        const response_body = await response.json()
        console.log("Success:", response_body.success)
        console.log("Message:", response_body.message)
        console.log("Error:", response_body.error)
        // if(response.ok){
        //     console.log("The response.ok status:", response.ok)
        //     const response_body = await response.json()
        // }
    }catch(error){
        console.log("An error was thrown,", error)
    }
}

// repeatWithDelay(sendPostReq, 2000, 5, 0)
export function Test(){
    return(
        <div>
            <button onClick = {() =>{sendPostReq()}}> Click to test post request</button>
        </div>
        )
}


export default function CreateOrderButton(){
    return (
        <div>
        <form>
            <input type = "string" name = "cust_name" required></input>
        </form>
        </div>
    )
}